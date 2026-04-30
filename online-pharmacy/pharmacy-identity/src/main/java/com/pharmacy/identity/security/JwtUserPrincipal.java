package com.pharmacy.identity.security;

public class JwtUserPrincipal {
    private Long userId;
    private String email;
    private String role;

    public JwtUserPrincipal() {
    }

    public JwtUserPrincipal(Long userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}