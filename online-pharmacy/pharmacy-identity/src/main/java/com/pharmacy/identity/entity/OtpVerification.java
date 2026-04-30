package com.pharmacy.identity.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications", uniqueConstraints = {
        @UniqueConstraint(name = "uk_otp_email_type", columnNames = {"email", "otp_type"})
})
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String otpCode;

    @Column(name = "otp_type", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private OtpType otpType = OtpType.LOGIN;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OtpStatus status = OtpStatus.PENDING;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "attempts")
    private int attempts = 0;

    public OtpVerification() {
    }

    public OtpVerification(Long id, String email, String otpCode, OtpType otpType, OtpStatus status, LocalDateTime expiresAt, LocalDateTime createdAt, LocalDateTime verifiedAt, int attempts) {
        this.id = id;
        this.email = email;
        this.otpCode = otpCode;
        this.otpType = otpType;
        this.status = status;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.verifiedAt = verifiedAt;
        this.attempts = attempts;
    }

    public static OtpVerificationBuilder builder() {
        return new OtpVerificationBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }

    public OtpType getOtpType() {
        return otpType;
    }

    public void setOtpType(OtpType otpType) {
        this.otpType = otpType;
    }

    public OtpStatus getStatus() {
        return status;
    }

    public void setStatus(OtpStatus status) {
        this.status = status;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return status == OtpStatus.PENDING && !isExpired();
    }

    public enum OtpType {
        LOGIN, SIGNUP, PASSWORD_RESET
    }

    public enum OtpStatus {
        PENDING, VERIFIED, EXPIRED, FAILED
    }

    public static class OtpVerificationBuilder {
        private Long id;
        private String email;
        private String otpCode;
        private OtpType otpType = OtpType.LOGIN;
        private OtpStatus status = OtpStatus.PENDING;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;
        private LocalDateTime verifiedAt;
        private int attempts = 0;

        public OtpVerificationBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public OtpVerificationBuilder email(String email) {
            this.email = email;
            return this;
        }

        public OtpVerificationBuilder otpCode(String otpCode) {
            this.otpCode = otpCode;
            return this;
        }

        public OtpVerificationBuilder otpType(OtpType otpType) {
            this.otpType = otpType;
            return this;
        }

        public OtpVerificationBuilder status(OtpStatus status) {
            this.status = status;
            return this;
        }

        public OtpVerificationBuilder expiresAt(LocalDateTime expiresAt) {
            this.expiresAt = expiresAt;
            return this;
        }

        public OtpVerificationBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public OtpVerificationBuilder verifiedAt(LocalDateTime verifiedAt) {
            this.verifiedAt = verifiedAt;
            return this;
        }

        public OtpVerificationBuilder attempts(int attempts) {
            this.attempts = attempts;
            return this;
        }

        public OtpVerification build() {
            return new OtpVerification(id, email, otpCode, otpType, status, expiresAt, createdAt, verifiedAt, attempts);
        }
    }
}