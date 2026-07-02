package com.anto.recruitment_system.service;

import com.anto.recruitment_system.entity.Application;
import com.anto.recruitment_system.entity.Notification;
import com.anto.recruitment_system.entity.User;
import com.anto.recruitment_system.repository.NotificationRepository;
import com.anto.recruitment_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUser_IdAndReadFalse(userId);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(notification -> !notification.isRead())
                .forEach(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                });
    }

    public void notifyUnderReview(Application application) {
        create(application,
                "Application under review",
                "Your application for %s is now being reviewed by HR."
                        .formatted(positionLabel(application)),
                "REVIEW");
    }

    public void notifyApproved(Application application) {
        create(application,
                "Application approved",
                "Congratulations! Your application for %s has been approved. Please prepare for the next recruitment stage."
                        .formatted(positionLabel(application)),
                "APPROVAL");
    }

    public void notifyRejected(Application application) {
        String reason = application.getRejectionReason() == null || application.getRejectionReason().isBlank()
                ? "No reason was provided."
                : application.getRejectionReason();

        create(application,
                "Application not approved",
                "Your application for %s was not approved. Reason: %s"
                        .formatted(positionLabel(application), reason),
                "REJECTION");
    }

    public void notifyInterviewScheduled(Application application) {
        String when = application.getInterviewScheduledAt() != null
                ? application.getInterviewScheduledAt().format(FORMATTER)
                : "To be confirmed";
        String location = application.getInterviewLocation() == null || application.getInterviewLocation().isBlank()
                ? "Location will be shared separately"
                : application.getInterviewLocation();
        String notes = application.getInterviewNotes() == null || application.getInterviewNotes().isBlank()
                ? ""
                : " Notes: " + application.getInterviewNotes();

        create(application,
                "Interview scheduled",
                "Your interview for %s is scheduled on %s at %s.%s Please be ready and arrive on time."
                        .formatted(positionLabel(application), when, location, notes),
                "INTERVIEW");
    }

    public Notification createCustom(Long userId,
                                     Long applicationId,
                                     String type,
                                     String title,
                                     String message) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }
        if (userId <= 0) {
            throw new IllegalArgumentException("userId must be a positive number");
        }
        if (applicationId != null && applicationId <= 0) {
            throw new IllegalArgumentException("applicationId must be a positive number when provided");
        }
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("type is required");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title is required");
        }
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for id=" + userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setApplicationId(applicationId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    private void create(Application application, String title, String message, String type) {
        if (application.getUser() == null || application.getUser().getId() == null) {
            return;
        }

        User user = userRepository.findById(application.getUser().getId()).orElse(null);
        if (user == null) {
            return;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setApplicationId(application.getId());
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    private String positionLabel(Application application) {
        if (application.getPositionApplied() != null && !application.getPositionApplied().isBlank()) {
            return application.getPositionApplied();
        }
        if (application.getJob() != null && application.getJob().getTitle() != null) {
            return application.getJob().getTitle();
        }
        return "your applied position";
    }
}
