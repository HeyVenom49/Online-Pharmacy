package com.pharmacy.identity.dto;

public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String mobile;
    private String role;
    private String status;
    private String message;

    public UserDTO() {
    }

    public UserDTO(Long id, String name, String email, String mobile, String role, String status, String message) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.role = role;
        this.status = status;
        this.message = message;
    }

    public static UserDTOBuilder builder() {
        return new UserDTOBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public static class UserDTOBuilder {
        private Long id;
        private String name;
        private String email;
        private String mobile;
        private String role;
        private String status;
        private String message;

        public UserDTOBuilder id(Long id) { this.id = id; return this; }
        public UserDTOBuilder name(String name) { this.name = name; return this; }
        public UserDTOBuilder email(String email) { this.email = email; return this; }
        public UserDTOBuilder mobile(String mobile) { this.mobile = mobile; return this; }
        public UserDTOBuilder role(String role) { this.role = role; return this; }
        public UserDTOBuilder status(String status) { this.status = status; return this; }
        public UserDTOBuilder message(String message) { this.message = message; return this; }

        public UserDTO build() {
            return new UserDTO(id, name, email, mobile, role, status, message);
        }
    }
}