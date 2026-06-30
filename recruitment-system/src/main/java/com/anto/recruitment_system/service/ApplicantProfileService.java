package com.anto.recruitment_system.service;

import com.anto.recruitment_system.dto.ProfileRequest;
import com.anto.recruitment_system.entity.ApplicantProfile;
import com.anto.recruitment_system.entity.User;
import com.anto.recruitment_system.repository.ApplicantProfileRepository;
import com.anto.recruitment_system.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class ApplicantProfileService {

    private final ApplicantProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ApplicantProfileService(ApplicantProfileRepository profileRepository,
                                   UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public ApplicantProfile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseGet(() -> createEmptyProfile(userId));
    }

    public ApplicantProfile saveProfile(Long userId, ProfileRequest request) {
        ApplicantProfile profile = getProfileByUserId(userId);
        applyRequest(profile, request);
        evaluateCompletion(profile);
        return profileRepository.save(profile);
    }

    public ApplicantProfile uploadCv(Long userId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CV file is required");
        }

        ApplicantProfile profile = getProfileByUserId(userId);
        profile.setCvUrl(storeFile(file, "cvs"));
        evaluateCompletion(profile);
        return profileRepository.save(profile);
    }

    public ApplicantProfile uploadSupportingDocument(Long userId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Supporting document is required");
        }

        ApplicantProfile profile = getProfileByUserId(userId);
        profile.setSupportingDocumentUrl(storeFile(file, "documents"));
        evaluateCompletion(profile);
        return profileRepository.save(profile);
    }

    public boolean isProfileComplete(Long userId) {
        return getProfileByUserId(userId).isProfileComplete();
    }

    private ApplicantProfile createEmptyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ApplicantProfile profile = new ApplicantProfile();
        profile.setUser(user);
        return profileRepository.save(profile);
    }

    private void applyRequest(ApplicantProfile profile, ProfileRequest request) {
        profile.setNationalId(trim(request.getNationalId()));
        profile.setPhone(trim(request.getPhone()));
        profile.setAddress(trim(request.getAddress()));
        profile.setDateOfBirth(trim(request.getDateOfBirth()));
        profile.setGender(trim(request.getGender()));
        profile.setEducation(trim(request.getEducation()));
        profile.setNesaGrade(trim(request.getNesaGrade()));
        profile.setNesaOption(trim(request.getNesaOption()));
        profile.setExperience(trim(request.getExperience()));
        profile.setSkills(trim(request.getSkills()));
        profile.setCertifications(trim(request.getCertifications()));
        profile.setNidVerified(request.isNidVerified());
        profile.setNesaVerified(request.isNesaVerified());
    }

    private void evaluateCompletion(ApplicantProfile profile) {
        boolean complete = isFilled(profile.getNationalId())
                && isFilled(profile.getPhone())
                && isFilled(profile.getAddress())
                && isFilled(profile.getEducation())
                && isFilled(profile.getExperience())
                && isFilled(profile.getSkills())
                && isFilled(profile.getCvUrl())
                && profile.isNidVerified()
                && profile.isNesaVerified();

        profile.setProfileComplete(complete);
    }

    private String storeFile(MultipartFile file, String folder) throws IOException {
        Path uploadDirectory = Path.of("uploads", folder);
        Files.createDirectories(uploadDirectory);

        String originalFilename = file.getOriginalFilename() == null
                ? "file"
                : Path.of(file.getOriginalFilename()).getFileName().toString();
        String storedFilename = UUID.randomUUID() + "-" + originalFilename;
        Path storedFile = uploadDirectory.resolve(storedFilename);
        file.transferTo(storedFile);
        return storedFile.toString();
    }

    private boolean isFilled(String value) {
        return value != null && !value.isBlank();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
