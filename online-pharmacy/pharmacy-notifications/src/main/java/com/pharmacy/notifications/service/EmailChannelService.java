package com.pharmacy.notifications.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailChannelService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:noreply@pharmacy.com}")
    private String fromEmail;

    public boolean deliver(String to, String subject, String body) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.debug("Skipping email (no JavaMailSender — configure spring.mail.host / MAIL_*)");
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "noreply@pharmacy.com";
            message.setFrom(sender);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to={} subject={}", to, subject);
            return true;
        } catch (Exception e) {
            log.error("Email failed to={} subject={}: {}", to, subject, e.getMessage(), e);
            return false;
        }
    }

    public Map<String, Object> healthCheck() {
        Map<String, Object> result = new LinkedHashMap<>();
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null) {
            result.put("configured", false);
            result.put("canConnect", false);
            result.put("message", "JavaMailSender is not configured. Set MAIL_HOST / spring.mail.host.");
            return result;
        }

        result.put("configured", true);
        result.put("fromEmail", (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "noreply@pharmacy.com");

        if (mailSender instanceof JavaMailSenderImpl senderImpl) {
            result.put("host", senderImpl.getHost());
            result.put("port", senderImpl.getPort());
            result.put("username", senderImpl.getUsername());

            try {
                senderImpl.testConnection();
                result.put("canConnect", true);
                result.put("message", "SMTP connection successful.");
            } catch (Exception e) {
                result.put("canConnect", false);
                result.put("message", "SMTP connection failed: " + e.getMessage());
            }
            return result;
        }

        result.put("canConnect", null);
        result.put("message", "Mail sender is configured, but connection test is unavailable for this implementation.");
        return result;
    }
}
