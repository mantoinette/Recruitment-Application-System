package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.entity.Notification;
import com.anto.recruitment_system.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getNotificationsForUser(userId);
    }

    @GetMapping("/user/{userId}/unread-count")
    public Map<String, Long> getUnreadCount(@PathVariable Long userId) {
        return Map.of("count", notificationService.getUnreadCount(userId));
    }

    @PostMapping("/user/{userId}")
    public Notification createCustomNotification(@PathVariable Long userId,
                                                 @RequestBody Map<String, Object> body) {
        if (body == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        Long applicationId = null;
        if (body.containsKey("applicationId") && body.get("applicationId") != null) {
            Object raw = body.get("applicationId");
            if (raw instanceof Number num) {
                applicationId = num.longValue();
            } else if (raw instanceof String s && !s.isBlank()) {
                try {
                    applicationId = Long.parseLong(s);
                } catch (NumberFormatException ex) {
                    throw new IllegalArgumentException("applicationId must be a number");
                }
            } else {
                throw new IllegalArgumentException("applicationId must be a number");
            }
        }

        String type = body.get("type") == null ? null : String.valueOf(body.get("type"));
        String title = body.get("title") == null ? null : String.valueOf(body.get("title"));
        String message = body.get("message") == null ? null : String.valueOf(body.get("message"));

        return notificationService.createCustom(userId, applicationId, type, title, message);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }
}
