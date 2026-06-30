package com.anto.recruitment_system.service;

import com.anto.recruitment_system.entity.*;
import com.anto.recruitment_system.repository.ApplicationRepository;
import com.anto.recruitment_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ApplicantProfileService profileService;
    private final JobVacancyService jobVacancyService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              UserRepository userRepository,
                              EmailService emailService,
                              ApplicantProfileService profileService,
                              JobVacancyService jobVacancyService) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.profileService = profileService;
        this.jobVacancyService = jobVacancyService;
    }

    public Application applyForJob(Long userId, Long jobId) {
        if (!profileService.isProfileComplete(userId)) {
            throw new IllegalArgumentException(
                    "Complete your profile before applying. Required: personal info, education, experience, skills, CV, and NID/NESA verification."
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

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
        return savedApplication;
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<Application> getApplicationsByUser(Long userId) {
        return applicationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Application> getLatestTenSortedAlphabetically() {
        return applicationRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .sorted(Comparator.comparing(
                        application -> application.getUser().getFullName(),
                        String.CASE_INSENSITIVE_ORDER
                ))
                .toList();
    }

    public List<Application> getApprovedApplications() {
        return applicationRepository.findAll()
                .stream()
                .filter(application -> application.getStatus() == ApplicationStatus.APPROVED)
                .sorted(Comparator.comparing(
                        application -> application.getUser().getFullName(),
                        String.CASE_INSENSITIVE_ORDER
                ))
                .toList();
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }

    public Application reviewApplication(Long id) {
        Application application = getApplicationById(id);
        application.setStatus(ApplicationStatus.REVIEWED);
        return applicationRepository.save(application);
    }

    public Application approveApplication(Long id) {
        Application application = getApplicationById(id);
        application.setStatus(ApplicationStatus.APPROVED);
        Application savedApplication = applicationRepository.save(application);
        sendApprovedEmail(savedApplication);
        return savedApplication;
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
        return savedApplication;
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
}
