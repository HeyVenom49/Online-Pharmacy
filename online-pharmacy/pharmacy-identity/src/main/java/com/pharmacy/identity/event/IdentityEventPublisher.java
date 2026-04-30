package com.pharmacy.identity.event;

import com.pharmacy.common.config.RabbitMQConfig;
import com.pharmacy.common.events.UserLoggedInEvent;
import com.pharmacy.common.events.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class IdentityEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(IdentityEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public IdentityEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishUserRegistered(UserRegisteredEvent event) {
        event.setEventId(UUID.randomUUID().toString());
        event.setEventType("USER_REGISTERED");
        event.setTimestamp(LocalDateTime.now());

        log.info("Publishing UserRegisteredEvent: userId={}, email={}", event.getUserId(), event.getEmail());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.USER_EXCHANGE,
                RabbitMQConfig.USER_REGISTERED_ROUTING,
                event
        );
    }

    public void publishUserLoggedIn(UserLoggedInEvent event) {
        event.setEventId(UUID.randomUUID().toString());
        event.setEventType("USER_LOGGED_IN");
        event.setTimestamp(LocalDateTime.now());

        log.info("Publishing UserLoggedInEvent: userId={}, email={}", event.getUserId(), event.getEmail());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.USER_EXCHANGE,
                RabbitMQConfig.USER_LOGGED_IN_ROUTING,
                event
        );
    }
}