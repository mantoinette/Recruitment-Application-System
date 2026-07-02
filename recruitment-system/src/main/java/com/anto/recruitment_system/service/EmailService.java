package com.anto.recruitment_system.service;

import com.anto.recruitment_system.entity.Application;
import com.anto.recruitment_system.entity.User;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public void sendApplicationUnderReviewEmail(Application application) {
        sendApplicationEmail(
                application,
                "Application received",
                """
                        Dear %s,

                        Your application has been submitted successfully and is now under review.

                        Application ID: %s
                        Status: %s

                        We will update your application status after HR review.

                        Recruitment Team
                        """
        );
    }

    public void sendApplicationApprovedEmail(Application application) {
        sendApplicationEmail(
                application,
                "Application approved - interview preparation",
                """
                        Dear %s,

                        Your application has been approved.

                        Application ID: %s
                        Status: %s

                        Please be ready for the interview stage. The HR team will contact you with the interview date, time, and next steps.

                        Recruitment Team
                        """
        );
    }

    public void sendApplicationRejectedEmail(Application application) {
        String reason = application.getRejectionReason() == null || application.getRejectionReason().isBlank()
                ? "No reason was provided."
                : application.getRejectionReason();

        sendApplicationEmail(
                application,
                "Application update",
                """
                        Dear %s,

                        Thank you for submitting your application.

                        Application ID: %s
                        Status: %s

                        Unfortunately, your application was not approved at this stage.

                        Reason: %s

                        Recruitment Team
                        """,
                reason
        );
    }

    public void sendInterviewScheduledEmail(Application application) {
        String when = application.getInterviewScheduledAt() != null
                ? application.getInterviewScheduledAt().toString().replace("T", " ")
                : "To be confirmed";
        String location = application.getInterviewLocation() == null || application.getInterviewLocation().isBlank()
                ? "Location will be shared separately"
                : application.getInterviewLocation();
        String notes = application.getInterviewNotes() == null || application.getInterviewNotes().isBlank()
                ? "None"
                : application.getInterviewNotes();

        sendApplicationEmail(
                application,
                "Interview scheduled - please be ready",
                """
                        Dear %s,

                        Your application has progressed to the interview stage.

                        Application ID: %s
                        Status: %s
                        Position: %s
                        Interview date & time: %s
                        Location: %s
                        Notes: %s

                        Please be ready for your interview and check your notifications in the recruitment portal.

                        Recruitment Team
                        """,
                application.getPositionApplied() != null ? application.getPositionApplied() : "Applied position",
                when,
                location,
                notes
        );
    }

    private void sendApplicationEmail(Application application, String subject, String bodyTemplate, Object... extraValues) {
        User user = application.getUser();

        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            System.err.println("Email not sent: application has no applicant email address.");
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null || fromEmail.isBlank()) {
            System.err.println("Email not sent: SMTP is not configured in application.properties.");
            return;
        }

        Object[] baseValues = {
                user.getFullName(),
                application.getId(),
                application.getStatus()
        };
        Object[] values = new Object[baseValues.length + extraValues.length];
        System.arraycopy(baseValues, 0, values, 0, baseValues.length);
        System.arraycopy(extraValues, 0, values, baseValues.length, extraValues.length);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject(subject);
        message.setText(bodyTemplate.formatted(values));

        mailSender.send(message);
    }
}
