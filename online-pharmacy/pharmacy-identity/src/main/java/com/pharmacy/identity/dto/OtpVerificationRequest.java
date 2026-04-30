package com.pharmacy.identity.dto;

import com.pharmacy.identity.entity.OtpVerification.OtpType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OtpVerificationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP code is required")
    private String otpCode;

    @NotNull(message = "OTP type is required")
    private OtpType otpType;

    public OtpVerificationRequest() {
    }

    public OtpVerificationRequest(String email, String otpCode, OtpType otpType) {
        this.email = email;
        this.otpCode = otpCode;
        this.otpType = otpType;
    }

    public static OtpVerificationRequestBuilder builder() {
        return new OtpVerificationRequestBuilder();
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

    public static class OtpVerificationRequestBuilder {
        private String email;
        private String otpCode;
        private OtpType otpType;

        public OtpVerificationRequestBuilder email(String email) {
            this.email = email;
            return this;
        }

        public OtpVerificationRequestBuilder otpCode(String otpCode) {
            this.otpCode = otpCode;
            return this;
        }

        public OtpVerificationRequestBuilder otpType(OtpType otpType) {
            this.otpType = otpType;
            return this;
        }

        public OtpVerificationRequest build() {
            return new OtpVerificationRequest(email, otpCode, otpType);
        }
    }
}