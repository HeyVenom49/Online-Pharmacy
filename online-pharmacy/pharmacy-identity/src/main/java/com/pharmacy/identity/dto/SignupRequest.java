package com.pharmacy.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @Size(max = 20, message = "Mobile number must not exceed 20 characters")
    private String mobile;

    public SignupRequest() {
    }

    public SignupRequest(String name, String email, String password, String mobile) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.mobile = mobile;
    }

    public static SignupRequestBuilder builder() {
        return new SignupRequestBuilder();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public static class SignupRequestBuilder {
        private String name;
        private String email;
        private String password;
        private String mobile;

        public SignupRequestBuilder name(String name) {
            this.name = name;
            return this;
        }

        public SignupRequestBuilder email(String email) {
            this.email = email;
            return this;
        }

        public SignupRequestBuilder password(String password) {
            this.password = password;
            return this;
        }

        public SignupRequestBuilder mobile(String mobile) {
            this.mobile = mobile;
            return this;
        }

        public SignupRequest build() {
            return new SignupRequest(name, email, password, mobile);
        }
    }
}