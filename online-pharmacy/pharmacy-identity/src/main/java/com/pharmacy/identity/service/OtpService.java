package com.pharmacy.identity.service;

import com.pharmacy.common.exception.BadRequestException;
import com.pharmacy.common.exception.ResourceNotFoundException;
import com.pharmacy.identity.dto.OtpRequest;
import com.pharmacy.identity.dto.OtpResponse;
import com.pharmacy.identity.dto.OtpVerificationRequest;
import com.pharmacy.identity.entity.OtpVerification;
import com.pharmacy.identity.entity.OtpVerification.OtpStatus;
import com.pharmacy.identity.entity.OtpVerification.OtpType;
import com.pharmacy.identity.repository.OtpVerificationRepository;
import com.pharmacy.identity.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final OtpVerificationRepository otpRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${otp.expiry-minutes:5}")
    private int expiryMinutes;

    @Value("${otp.max-attempts:3}")
    private int maxAttempts;

    private static final String OTP_CHARS = "0123456789";
    private static final int OTP_LENGTH = 6;

    public OtpService(OtpVerificationRepository otpRepository, UserRepository userRepository, NotificationService notificationService) {
        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public OtpResponse generateOtp(OtpRequest request) {
        String email = request.getEmail();
        OtpType otpType = request.getOtpType();

        if (otpType == OtpType.LOGIN || otpType == OtpType.PASSWORD_RESET) {
            userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        }

        String otpCode = generateSecureOtp();
        log.debug("Generated OTP code: {} for {}", otpCode, email);
        otpRepository.deleteByEmailAndOtpType(email, otpType);
        log.debug("Deleted old OTP records for {}", email);

        OtpVerification otp = OtpVerification.builder()
                .email(email)
                .otpCode(otpCode)
                .otpType(otpType)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .build();
        OtpVerification saved = otpRepository.save(otp);
        log.debug("Saved OTP with id: {} for {}", saved.getId(), email);

        boolean emailSent = notificationService.sendOtpEmail(email, otpCode, otpType.name());
        if (!emailSent) {
            log.error("OTP generated but email delivery failed for {} type {}", email, otpType);
            // Don't throw exception - OTP is already saved
        }

        log.info("Generated OTP for {} with type {}", email, otpType);

        return OtpResponse.builder()
                .email(email)
                .otpType(otpType.name())
                .expiresInMinutes(expiryMinutes)
                .message("OTP sent to your email")
                .build();
    }

    @Transactional
    public OtpResponse verifyOtp(OtpVerificationRequest request) {
        String email = request.getEmail();
        String otpCode = request.getOtpCode();
        OtpType otpType = request.getOtpType();

        OtpVerification otp = otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                        email, otpType, OtpStatus.PENDING)
                .orElseThrow(() -> new BadRequestException("No OTP found. Please request a new OTP."));
        log.debug("Found OTP for {}: code={}, attempts={}, expiresAt={}", email, otp.getOtpCode(), otp.getAttempts(), otp.getExpiresAt());

        if (otp.isExpired()) {
            otp.setStatus(OtpStatus.EXPIRED);
            otpRepository.save(otp);
            throw new BadRequestException("OTP has expired. Please request a new OTP.");
        }

        if (otp.getAttempts() >= maxAttempts) {
            otp.setStatus(OtpStatus.FAILED);
            otpRepository.save(otp);
            throw new BadRequestException("Too many failed attempts. Please request a new OTP.");
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            throw new BadRequestException("Invalid OTP. Please try again.");
        }

        otp.setStatus(OtpStatus.VERIFIED);
        otp.setVerifiedAt(LocalDateTime.now());
        otpRepository.save(otp);

        log.info("OTP verified successfully for {} with type {}", email, otpType);

        return OtpResponse.builder()
                .email(email)
                .otpType(otpType.name())
                .message("OTP verified successfully")
                .verified(true)
                .build();
    }

    public boolean isOtpVerified(String email, OtpType otpType) {
        return otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                        email, otpType, OtpStatus.VERIFIED)
                .map(otp -> !otp.isExpired() && otp.getVerifiedAt() != null)
                .orElse(false);
    }

    private String generateSecureOtp() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(OTP_CHARS.charAt(random.nextInt(OTP_CHARS.length())));
        }
        return sb.toString();
    }
}