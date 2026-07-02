package com.anto.recruitment_system.service;

import com.anto.recruitment_system.dto.InterviewRequest;
import com.anto.recruitment_system.entity.*;
import com.anto.recruitment_system.repository.ApplicationRepository;
import com.anto.recruitment_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ApplicantProfileService profileService;
    private final JobVacancyService jobVacancyService;
    private final NotificationService notificationService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              UserRepository userRepository,
                              EmailService emailService,
                              ApplicantProfileService profileService,
                              JobVacancyService jobVacancyService,
                              NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.profileService = profileService;
        this.jobVacancyService = jobVacancyService;
        this.notificationService = notificationService;
    }

    public Application applyForJob(Long userId, Long jobId) {
        if (!profileService.isProfileComplete(userId)) {
            throw new IllegalArgumentException(
                    "Complete your profile before applying. Required: personal info, education, experience, skills, CV, and NID/NESA verification."
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isActive()) {
            throw new IllegalArgumentException("Your account is inactive");
        }

        JobVacancy job = jobVacancyService.getJobById(jobId);
        if (job.getStatus() != JobStatus.OPEN) {
            throw new IllegalArgumentException("This job vacancy is no longer open");
        }

        ApplicantProfile profile = profileService.getProfileByUserId(userId);

        boolean alreadyApplied = applicationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .anyMatch(application -> application.getJob() != null
                        && application.getJob().getId().equals(jobId));

        if (alreadyApplied) {
            throw new IllegalArgumentException("You have already applied for this position");
        }

        Application application = new Application();
        application.setNationalId(profile.getNationalId());
        application.setPhone(profile.getPhone());
        application.setAddress(profile.getAddress());
        application.setEducation(profile.getEducation());
        application.setNesaGrade(profile.getNesaGrade());
        application.setNesaOption(profile.getNesaOption());
        application.setExperience(profile.getExperience());
        application.setPositionApplied(job.getTitle());
        application.setCvUrl(profile.getCvUrl());
        application.setUser(user);
        application.setJob(job);
        application.setStatus(ApplicationStatus.PENDING);

        Application savedApplication = applicationRepository.save(application);
        sendUnderReviewEmail(savedApplication);
        notificationService.notifyUnderReview(savedApplication);
        return savedApplication;
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAllValidWithUserAndJob();
    }

    public List<Application> getApplicationsByUser(Long userId) {
        return applicationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(this::isValidApplication)
                .toList();
    }

    public List<Application> getLatestTenSortedAlphabetically() {
        return applicationRepository.findTop10ByUserIsNotNullAndJobIsNotNullOrderByCreatedAtDesc()
                .stream()
                .sorted(byApplicantName())
                .toList();
    }

    public List<Application> getAllSortedAlphabetically(String search, String status) {
        String query = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        ApplicationStatus statusFilter = parseStatus(status);

        return applicationRepository.findAllValidWithUserAndJob()
                .stream()
                .filter(application -> statusFilter == null || application.getStatus() == statusFilter)
                .filter(application -> matchesSearch(application, query))
                .sorted(byApplicantName())
                .toList();
    }

    public List<Application> getInterviewApplications() {
        return applicationRepository.findAllValidWithUserAndJob()
                .stream()
                .filter(application -> application.getStatus() == ApplicationStatus.INTERVIEW)
                .sorted(byApplicantName())
                .toList();
    }

    public List<Application> getApprovedApplications() {
        return applicationRepository.findAllValidWithUserAndJob()
                .stream()
                .filter(application -> application.getStatus() == ApplicationStatus.APPROVED)
                .sorted(byApplicantName())
                .toList();
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findValidDetailedById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }

    public Application reviewApplication(Long id) {
        Application application = updateStatus(id, ApplicationStatus.UNDER_REVIEW);
        notificationService.notifyUnderReview(application);
        return application;
    }

    public Application approveApplication(Long id) {
        Application application = updateStatus(id, ApplicationStatus.APPROVED);
        sendApprovedEmail(application);
        notificationService.notifyApproved(application);
        return application;
    }

    public Application rejectApplication(Long id, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        Application application = getApplicationById(id);
        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason(reason.trim());
        Application savedApplication = applicationRepository.save(application);
        sendRejectedEmail(savedApplication);
        notificationService.notifyRejected(savedApplication);
        return savedApplication;
    }

    public Application updateStatus(Long id, ApplicationStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }

        Application application = getApplicationById(id);
        application.setStatus(status);
        return applicationRepository.save(application);
    }

    public Application scheduleInterview(Long id, InterviewRequest request) {
        if (request.getScheduledAt() == null) {
            throw new IllegalArgumentException("Interview date and time are required");
        }

        Application application = getApplicationById(id);
        application.setInterviewScheduledAt(request.getScheduledAt());
        application.setInterviewLocation(request.getLocation());
        application.setInterviewNotes(request.getNotes());
        application.setStatus(ApplicationStatus.INTERVIEW);
        Application savedApplication = applicationRepository.save(application);
        sendInterviewScheduledEmail(savedApplication);
        notificationService.notifyInterviewScheduled(savedApplication);
        return savedApplication;
    }

    private ApplicationStatus parseStatus(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return null;
        }

        try {
            return ApplicationStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid application status filter");
        }
    }

    private boolean matchesSearch(Application application, String query) {
        if (query.isEmpty()) {
            return true;
        }

        String name = applicantName(application);
        String email = application.getUser() != null && application.getUser().getEmail() != null
                ? application.getUser().getEmail()
                : "";
        String position = application.getPositionApplied() != null ? application.getPositionApplied() : "";

        return name.toLowerCase(Locale.ROOT).contains(query)
                || email.toLowerCase(Locale.ROOT).contains(query)
                || position.toLowerCase(Locale.ROOT).contains(query);
    }

    private Comparator<Application> byApplicantName() {
        return Comparator.comparing(this::applicantName, String.CASE_INSENSITIVE_ORDER);
    }

    private String applicantName(Application application) {
        if (application.getUser() == null || application.getUser().getFullName() == null) {
            return "";
        }
        return application.getUser().getFullName();
    }

    private boolean isValidApplication(Application application) {
        return application.getUser() != null && application.getJob() != null;
    }

    private void sendUnderReviewEmail(Application application) {
        try {
            emailService.sendApplicationUnderReviewEmail(application);
        } catch (RuntimeException emailError) {
            System.err.println("Application saved, but confirmation email failed: " + emailError.getMessage());
        }
    }

    private void sendApprovedEmail(Application application) {
        try {
            emailService.sendApplicationApprovedEmail(application);
        } catch (RuntimeException emailError) {
            System.err.println("Application approved, but approval email failed: " + emailError.getMessage());
        }
    }

    private void sendRejectedEmail(Application application) {
        try {
            emailService.sendApplicationRejectedEmail(application);
        } catch (RuntimeException emailError) {
            System.err.println("Application rejected, but rejection email failed: " + emailError.getMessage());
        }
    }

    private void sendInterviewScheduledEmail(Application application) {
        try {
            emailService.sendInterviewScheduledEmail(application);
        } catch (RuntimeException emailError) {
            System.err.println("Interview scheduled, but email failed: " + emailError.getMessage());
        }
    }
}
