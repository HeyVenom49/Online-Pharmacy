package com.pharmacy.identity.dto;

public class AuthResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String email;
    private String name;
    private String mobile;
    private String role;
    private Boolean otpRequired;

    public AuthResponse() {
    }

    public AuthResponse(String token, String tokenType, Long userId, String email, String name, String mobile, String role, Boolean otpRequired) {
        this.token = token;
        this.tokenType = tokenType;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.mobile = mobile;
        this.role = role;
        this.otpRequired = otpRequired;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getOtpRequired() {
        return otpRequired;
    }

    public void setOtpRequired(Boolean otpRequired) {
        this.otpRequired = otpRequired;
    }

    public static class AuthResponseBuilder {
        private String token;
        private String tokenType;
        private Long userId;
        private String email;
        private String name;
        private String mobile;
        private String role;
        private Boolean otpRequired;

        public AuthResponseBuilder token(String token) {
            this.token = token;
            return this;
        }

        public AuthResponseBuilder tokenType(String tokenType) {
            this.tokenType = tokenType;
            return this;
        }

        public AuthResponseBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public AuthResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public AuthResponseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public AuthResponseBuilder mobile(String mobile) {
            this.mobile = mobile;
            return this;
        }

        public AuthResponseBuilder role(String role) {
            this.role = role;
            return this;
        }

        public AuthResponseBuilder otpRequired(Boolean otpRequired) {
            this.otpRequired = otpRequired;
            return this;
        }

        public AuthResponse build() {
            return new AuthResponse(token, tokenType, userId, email, name, mobile, role, otpRequired);
        }
    }
}