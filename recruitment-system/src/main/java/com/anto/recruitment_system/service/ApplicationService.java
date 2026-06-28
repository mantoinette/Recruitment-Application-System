package com.anto.recruitment_system.service;

import com.anto.recruitment_system.entity.Application;
import com.anto.recruitment_system.entity.ApplicationStatus;
import com.anto.recruitment_system.entity.User;
import com.anto.recruitment_system.repository.ApplicationRepository;
import com.anto.recruitment_system.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              UserRepository userRepository,
                              EmailService emailService) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Applicant submits application
    public Application submitApplication(Application application) {

        // Every new application starts as PENDING
        application.setStatus(ApplicationStatus.PENDING);

        Application savedApplication = applicationRepository.save(application);

        sendUnderReviewEmail(savedApplication);

        return savedApplication;
    }

    public Application submitApplicationWithCv(
            Long userId,
            String phone,
            String address,
            String education,
            String experience,
            MultipartFile file) throws IOException {

        if (userId == null) {
            throw new IllegalArgumentException("User is required");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CV file is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Path uploadDirectory = Path.of("uploads", "cvs");
        Files.createDirectories(uploadDirectory);

        String originalFilename = file.getOriginalFilename() == null
                ? "cv"
                : Path.of(file.getOriginalFilename()).getFileName().toString();
        String storedFilename = UUID.randomUUID() + "-" + originalFilename;
        Path storedFile = uploadDirectory.resolve(storedFilename);

        file.transferTo(storedFile);

        Application application = new Application();
        application.setPhone(phone);
        application.setAddress(address);
        application.setEducation(education);
        application.setExperience(experience);
        application.setCvUrl(storedFile.toString());
        application.setUser(user);
        application.setStatus(ApplicationStatus.PENDING);

        Application savedApplication = applicationRepository.save(application);

        sendUnderReviewEmail(savedApplication);

        return savedApplication;
    }

    // Get all applications
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    // Get one application
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id).orElse(null);
    }

    // Delete application
    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }

    // HR approves application
    public Application approveApplication(Long id) {

        Application application =
                applicationRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.APPROVED);

        Application savedApplication = applicationRepository.save(application);

        sendApprovedEmail(savedApplication);

        return savedApplication;
    }

    // HR rejects application
    public Application rejectApplication(Long id, String reason) {

        Application application =
                applicationRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.REJECTED);

        application.setRejectionReason(reason);

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
