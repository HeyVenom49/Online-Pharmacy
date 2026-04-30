package com.pharmacy.identity.dto;

public class OtpResponse {

    private String email;
    private String otpType;
    private String message;
    private Integer expiresInMinutes;
    private Boolean verified;

    public OtpResponse() {
    }

    public OtpResponse(String email, String otpType, String message, Integer expiresInMinutes, Boolean verified) {
        this.email = email;
        this.otpType = otpType;
        this.message = message;
        this.expiresInMinutes = expiresInMinutes;
        this.verified = verified;
    }

    public static OtpResponseBuilder builder() {
        return new OtpResponseBuilder();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpType() {
        return otpType;
    }

    public void setOtpType(String otpType) {
        this.otpType = otpType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getExpiresInMinutes() {
        return expiresInMinutes;
    }

    public void setExpiresInMinutes(Integer expiresInMinutes) {
        this.expiresInMinutes = expiresInMinutes;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public static class OtpResponseBuilder {
        private String email;
        private String otpType;
        private String message;
        private Integer expiresInMinutes;
        private Boolean verified;

        public OtpResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public OtpResponseBuilder otpType(String otpType) {
            this.otpType = otpType;
            return this;
        }

        public OtpResponseBuilder message(String message) {
            this.message = message;
            return this;
        }

        public OtpResponseBuilder expiresInMinutes(Integer expiresInMinutes) {
            this.expiresInMinutes = expiresInMinutes;
            return this;
        }

        public OtpResponseBuilder verified(Boolean verified) {
            this.verified = verified;
            return this;
        }

        public OtpResponse build() {
            return new OtpResponse(email, otpType, message, expiresInMinutes, verified);
        }
    }
}