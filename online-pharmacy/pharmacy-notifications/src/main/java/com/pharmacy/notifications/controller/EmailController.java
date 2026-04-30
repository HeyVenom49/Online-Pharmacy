package com.pharmacy.notifications.controller;

import com.pharmacy.notifications.service.EmailChannelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    private final EmailChannelService emailChannelService;

    public EmailController(EmailChannelService emailChannelService) {
        this.emailChannelService = emailChannelService;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendEmail(@RequestBody EmailRequest request) {
        boolean sent = emailChannelService.deliver(request.to(), request.subject(), request.body());
        
        if (sent) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Email sent successfully"
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Email sending skipped or failed"
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> emailHealth() {
        Map<String, Object> health = emailChannelService.healthCheck();
        Object canConnect = health.get("canConnect");

        if (Boolean.TRUE.equals(canConnect)) {
            return ResponseEntity.ok(health);
        }

        return ResponseEntity.status(503).body(health);
    }

    public record EmailRequest(String to, String subject, String body) {}
}