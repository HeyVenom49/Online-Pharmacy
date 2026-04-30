package com.pharmacy.identity.service;

import com.pharmacy.common.exception.BadRequestException;
import com.pharmacy.common.exception.ResourceNotFoundException;
import com.pharmacy.identity.dto.OtpRequest;
import com.pharmacy.identity.dto.OtpResponse;
import com.pharmacy.identity.dto.OtpVerificationRequest;
import com.pharmacy.identity.entity.OtpVerification;
import com.pharmacy.identity.entity.OtpVerification.OtpStatus;
import com.pharmacy.identity.entity.OtpVerification.OtpType;
import com.pharmacy.identity.entity.User;
import com.pharmacy.identity.repository.OtpVerificationRepository;
import com.pharmacy.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpVerificationRepository otpRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OtpService otpService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(otpService, "expiryMinutes", 5);
        ReflectionTestUtils.setField(otpService, "maxAttempts", 3);
        
        existingUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .passwordHash("hash")
                .role(com.pharmacy.common.enums.Role.CUSTOMER)
                .status(com.pharmacy.common.enums.UserStatus.ACTIVE)
                .build();
    }

    @Test
    void generateOtp_createsOtpAndSavesToRepository() {
        OtpRequest request = new OtpRequest("test@example.com", OtpType.LOGIN);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));
        when(otpRepository.save(any(OtpVerification.class))).thenAnswer(i -> {
            OtpVerification otp = i.getArgument(0);
            ReflectionTestUtils.setField(otp, "id", 1L);
            return otp;
        });

        OtpResponse response = otpService.generateOtp(request);

        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("OTP sent to your email", response.getMessage());

        ArgumentCaptor<OtpVerification> otpCaptor = ArgumentCaptor.forClass(OtpVerification.class);
        verify(otpRepository).save(otpCaptor.capture());
        
        OtpVerification savedOtp = otpCaptor.getValue();
        assertEquals("test@example.com", savedOtp.getEmail());
        assertEquals(OtpType.LOGIN, savedOtp.getOtpType());
        assertEquals(OtpStatus.PENDING, savedOtp.getStatus());
        assertNotNull(savedOtp.getOtpCode());
        assertEquals(6, savedOtp.getOtpCode().length());
        assertTrue(savedOtp.getExpiresAt().isAfter(LocalDateTime.now()));

        verify(notificationService).sendOtpEmail(eq("test@example.com"), anyString(), eq("LOGIN"));
    }

    @Test
    void generateOtp_deletesExistingOtpBeforeCreatingNew() {
        OtpRequest request = new OtpRequest("test@example.com", OtpType.SIGNUP);
        lenient().when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));
        when(otpRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        otpService.generateOtp(request);

        verify(otpRepository).deleteByEmailAndOtpType("test@example.com", OtpType.SIGNUP);
        verify(otpRepository).save(any(OtpVerification.class));
    }

    @Test
    void generateOtp_throwsWhenUserNotFound() {
        OtpRequest request = new OtpRequest("nonexistent@example.com", OtpType.LOGIN);
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> otpService.generateOtp(request));
    }

    @Test
    void generateOtp_signupDoesNotRequireExistingUser() {
        OtpRequest request = new OtpRequest("newuser@example.com", OtpType.SIGNUP);
        when(otpRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        OtpResponse response = otpService.generateOtp(request);

        assertNotNull(response);
        assertEquals("newuser@example.com", response.getEmail());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void verifyOtp_success() {
        String email = "test@example.com";
        String otpCode = "123456";
        OtpVerification otp = OtpVerification.builder()
                .id(1L)
                .email(email)
                .otpCode(otpCode)
                .otpType(OtpType.LOGIN)
                .status(OtpStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .attempts(0)
                .build();
        when(otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                email, OtpType.LOGIN, OtpStatus.PENDING)).thenReturn(Optional.of(otp));
        when(otpRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        OtpResponse response = otpService.verifyOtp(
                new OtpVerificationRequest(email, otpCode, OtpType.LOGIN));

        assertTrue(response.getVerified());
        assertEquals("OTP verified successfully", response.getMessage());
        assertEquals(OtpStatus.VERIFIED, otp.getStatus());
        assertNotNull(otp.getVerifiedAt());
    }

    @Test
    void verifyOtp_throwsWhenOtpNotFound() {
        when(otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                anyString(), any(), any())).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () ->
                otpService.verifyOtp(new OtpVerificationRequest("test@example.com", "123456", OtpType.LOGIN)));
    }

    @Test
    void verifyOtp_throwsWhenOtpExpired() {
        OtpVerification expiredOtp = OtpVerification.builder()
                .id(1L)
                .email("test@example.com")
                .otpCode("123456")
                .otpType(OtpType.LOGIN)
                .status(OtpStatus.PENDING)
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .attempts(0)
                .build();
        when(otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                anyString(), any(), any())).thenReturn(Optional.of(expiredOtp));
        when(otpRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        assertThrows(BadRequestException.class, () ->
                otpService.verifyOtp(new OtpVerificationRequest("test@example.com", "123456", OtpType.LOGIN)));
    }

    @Test
    void verifyOtp_throwsWhenMaxAttemptsExceeded() {
        OtpVerification otp = OtpVerification.builder()
                .id(1L)
                .email("test@example.com")
                .otpCode("123456")
                .otpType(OtpType.LOGIN)
                .status(OtpStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .attempts(3)
                .build();
        when(otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                anyString(), any(), any())).thenReturn(Optional.of(otp));
        when(otpRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        assertThrows(BadRequestException.class, () ->
                otpService.verifyOtp(new OtpVerificationRequest("test@example.com", "123456", OtpType.LOGIN)));
    }

    @Test
    void verifyOtp_throwsWhenOtpCodeInvalid() {
        OtpVerification otp = OtpVerification.builder()
                .id(1L)
                .email("test@example.com")
                .otpCode("123456")
                .otpType(OtpType.LOGIN)
                .status(OtpStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .attempts(0)
                .build();
        when(otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                anyString(), any(), any())).thenReturn(Optional.of(otp));
        when(otpRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        assertThrows(BadRequestException.class, () ->
                otpService.verifyOtp(new OtpVerificationRequest("test@example.com", "wrong", OtpType.LOGIN)));
    }

    @Test
    void verifyOtp_incrementsAttemptsOnInvalidCode() {
        OtpVerification otp = OtpVerification.builder()
                .id(1L)
                .email("test@example.com")
                .otpCode("123456")
                .otpType(OtpType.LOGIN)
                .status(OtpStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .attempts(0)
                .build();
        when(otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                anyString(), any(), any())).thenReturn(Optional.of(otp));
        when(otpRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        try {
            otpService.verifyOtp(new OtpVerificationRequest("test@example.com", "wrong", OtpType.LOGIN));
        } catch (BadRequestException e) {
            // expected
        }

        assertEquals(1, otp.getAttempts());
    }

    @Test
    void isOtpVerified_returnsTrueWhenVerifiedAndNotExpired() {
        OtpVerification otp = OtpVerification.builder()
                .id(1L)
                .email("test@example.com")
                .otpCode("123456")
                .otpType(OtpType.LOGIN)
                .status(OtpStatus.VERIFIED)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .verifiedAt(LocalDateTime.now())
                .attempts(0)
                .build();
        when(otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                "test@example.com", OtpType.LOGIN, OtpStatus.VERIFIED)).thenReturn(Optional.of(otp));

        assertTrue(otpService.isOtpVerified("test@example.com", OtpType.LOGIN));
    }

    @Test
    void isOtpVerified_returnsFalseWhenNotVerified() {
        when(otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                anyString(), any(), any())).thenReturn(Optional.empty());

        assertFalse(otpService.isOtpVerified("test@example.com", OtpType.LOGIN));
    }

    @Test
    void isOtpVerified_returnsFalseWhenExpired() {
        OtpVerification otp = OtpVerification.builder()
                .id(1L)
                .email("test@example.com")
                .otpCode("123456")
                .otpType(OtpType.LOGIN)
                .status(OtpStatus.VERIFIED)
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .verifiedAt(LocalDateTime.now())
                .attempts(0)
                .build();
        when(otpRepository.findTopByEmailAndOtpTypeAndStatusOrderByCreatedAtDesc(
                "test@example.com", OtpType.LOGIN, OtpStatus.VERIFIED)).thenReturn(Optional.of(otp));

        assertFalse(otpService.isOtpVerified("test@example.com", OtpType.LOGIN));
    }

    @Test
    void generateSecureOtp_returnsSixDigitCode() {
        OtpRequest request = new OtpRequest("test@example.com", OtpType.SIGNUP);
        when(otpRepository.save(any())).thenAnswer(i -> {
            OtpVerification otp = i.getArgument(0);
            return otp;
        });

        otpService.generateOtp(request);

        ArgumentCaptor<OtpVerification> captor = ArgumentCaptor.forClass(OtpVerification.class);
        verify(otpRepository).save(captor.capture());
        
        String otpCode = captor.getValue().getOtpCode();
        assertEquals(6, otpCode.length());
        assertTrue(otpCode.matches("\\d+"));
    }
}