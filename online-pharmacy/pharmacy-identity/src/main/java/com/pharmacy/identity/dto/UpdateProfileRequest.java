package com.pharmacy.identity.dto;

import jakarta.validation.constraints.Email;

public class UpdateProfileRequest {

    private String name;

    @Email(message = "Invalid email format")
    private String email;

    private String mobile;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String name, String email, String mobile) {
        this.name = name;
        this.email = email;
        this.mobile = mobile;
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

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }
}