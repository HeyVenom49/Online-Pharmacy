package com.pharmacy.identity.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String referenceId;
    private Boolean isRead;
    private Boolean emailSent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public NotificationDTO() {
    }

    public NotificationDTO(Long id, String type, String title, String message, String referenceId, Boolean isRead, Boolean emailSent, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.referenceId = referenceId;
        this.isRead = isRead;
        this.emailSent = emailSent;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static NotificationDTOBuilder builder() {
        return new NotificationDTOBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Boolean getEmailSent() {
        return emailSent;
    }

    public void setEmailSent(Boolean emailSent) {
        this.emailSent = emailSent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class NotificationDTOBuilder {
        private Long id;
        private String type;
        private String title;
        private String message;
        private String referenceId;
        private Boolean isRead;
        private Boolean emailSent;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public NotificationDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public NotificationDTOBuilder type(String type) {
            this.type = type;
            return this;
        }

        public NotificationDTOBuilder title(String title) {
            this.title = title;
            return this;
        }

        public NotificationDTOBuilder message(String message) {
            this.message = message;
            return this;
        }

        public NotificationDTOBuilder referenceId(String referenceId) {
            this.referenceId = referenceId;
            return this;
        }

        public NotificationDTOBuilder isRead(Boolean isRead) {
            this.isRead = isRead;
            return this;
        }

        public NotificationDTOBuilder emailSent(Boolean emailSent) {
            this.emailSent = emailSent;
            return this;
        }

        public NotificationDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public NotificationDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public NotificationDTO build() {
            return new NotificationDTO(id, type, title, message, referenceId, isRead, emailSent, createdAt, updatedAt);
        }
    }
}