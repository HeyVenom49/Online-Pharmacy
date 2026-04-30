package com.pharmacy.identity.dto;

import com.pharmacy.identity.entity.OtpVerification.OtpType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OtpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "OTP type is required")
    private OtpType otpType;

    public OtpRequest() {
    }

    public OtpRequest(String email, OtpType otpType) {
        this.email = email;
        this.otpType = otpType;
    }

    public static OtpRequestBuilder builder() {
        return new OtpRequestBuilder();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public OtpType getOtpType() {
        return otpType;
    }

    public void setOtpType(OtpType otpType) {
        this.otpType = otpType;
    }

    public enum OtpTypeEnum {
        LOGIN, SIGNUP, PASSWORD_RESET
    }

    public static class OtpRequestBuilder {
        private String email;
        private OtpType otpType;

        public OtpRequestBuilder email(String email) {
            this.email = email;
            return this;
        }

        public OtpRequestBuilder otpType(OtpType otpType) {
            this.otpType = otpType;
            return this;
        }

        public OtpRequest build() {
            return new OtpRequest(email, otpType);
        }
    }
}