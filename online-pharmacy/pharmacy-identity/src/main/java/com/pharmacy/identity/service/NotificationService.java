package com.pharmacy.identity.service;

import com.pharmacy.common.dto.PageResponse;
import com.pharmacy.common.exception.ResourceNotFoundException;
import com.pharmacy.identity.dto.NotificationDTO;
import com.pharmacy.identity.entity.Notification;
import com.pharmacy.identity.entity.Notification.NotificationType;
import com.pharmacy.identity.entity.User;
import com.pharmacy.identity.repository.NotificationRepository;
import com.pharmacy.identity.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Value("${notifications.service.url:http://localhost:8085}")
    private String notificationsServiceUrl;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public NotificationDTO createNotification(Long userId, NotificationType type, String title,
                                              String message, String referenceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .isRead(false)
                .emailSent(false)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Created notification id={} for userId={} type={}", notification.getId(), userId, type);
        return toDTO(notification);
    }

    public boolean sendOtpEmail(String email, String otpCode, String otpType) {
        try {
            String subject = "Your " + otpType + " verification code";
            String body = String.format(
                    "Your verification code is: %s\n\nThis code will expire in 5 minutes.\n\n" +
                    "If you didn't request this, please ignore this email.",
                    otpCode);

            RestTemplate restTemplate = new RestTemplate();
            String url = notificationsServiceUrl + "/api/emails/send";

            java.util.Map<String, String> request = java.util.Map.of(
                    "to", email,
                    "subject", subject,
                    "body", body
            );

            ResponseEntity<java.util.Map> response = restTemplate.postForEntity(url, request, java.util.Map.class);
            boolean success = response.getStatusCode().is2xxSuccessful()
                    && response.getBody() != null
                    && Boolean.TRUE.equals(response.getBody().get("success"));

            if (success) {
                log.info("OTP email sent to {}", email);
                return true;
            }

            log.error("Notifications service responded but email was not sent. url={} email={} response={}",
                    url, email, response.getBody());
            return false;
        } catch (Exception e) {
            log.error("Failed to send OTP email to {} via {}: {}", email, notificationsServiceUrl, e.getMessage(), e);
            return false;
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationDTO> getUserNotifications(Long userId, int page, int size) {
        Page<Notification> notificationPage = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));

        List<NotificationDTO> dtos = notificationPage.getContent().stream()
                .map(this::toDTO)
                .toList();

        return PageResponse.<NotificationDTO>builder()
                .content(dtos)
                .page(notificationPage.getNumber())
                .size(notificationPage.getSize())
                .totalElements(notificationPage.getTotalElements())
                .totalPages(notificationPage.getTotalPages())
                .first(notificationPage.isFirst())
                .last(notificationPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationDTO markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for this user");
        }

        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return toDTO(notification);
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void markEmailSent(Long notificationId) {
        notificationRepository.markEmailSent(notificationId);
    }

    private NotificationDTO toDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .isRead(notification.getIsRead())
                .emailSent(notification.getEmailSent())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}