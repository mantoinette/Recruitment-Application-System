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

    private static final String RWANDAN = "RWANDAN";

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
        syncUserDetails(profile.getUser(), request);
        evaluateCompletion(profile);
        return profileRepository.save(profile);
    }

    public ApplicantProfile uploadCv(Long userId, MultipartFile file) throws IOException {
        return uploadFile(userId, file, "cvs", "CV");
    }

    public ApplicantProfile uploadDegree(Long userId, MultipartFile file) throws IOException {
        return uploadFile(userId, file, "degrees", "Degree");
    }

    public ApplicantProfile uploadCertificates(Long userId, MultipartFile file) throws IOException {
        return uploadFile(userId, file, "certificates", "Certificates");
    }

    public ApplicantProfile uploadSupportingDocument(Long userId, MultipartFile file) throws IOException {
        return uploadFile(userId, file, "documents", "Supporting document");
    }

    public boolean isProfileComplete(Long userId) {
        return getProfileByUserId(userId).isProfileComplete();
    }

    public java.util.List<String> getMissingRequirements(Long userId) {
        return getMissingRequirements(getProfileByUserId(userId));
    }

    private java.util.List<String> getMissingRequirements(ApplicantProfile profile) {
        java.util.List<String> missing = new java.util.ArrayList<>();
        boolean rwandan = RWANDAN.equalsIgnoreCase(profile.getNationality());

        if (!isFilled(profile.getNationality())) missing.add("Nationality");
        if (rwandan && !profile.isNidVerified()) missing.add("NID verification");
        if (rwandan && !isFilled(profile.getNationalId())) missing.add("National ID");
        if (!isFilled(profile.getUser() != null ? profile.getUser().getFullName() : null)) missing.add("Full name");
        if (!isFilled(profile.getGender())) missing.add("Gender");
        if (!isFilled(profile.getDateOfBirth())) missing.add("Date of birth");
        if (!isFilled(profile.getDistrict())) missing.add("District");
        if (!isFilled(profile.getSector())) missing.add("Sector");
        if (rwandan && !profile.isNesaVerified()) missing.add("NESA academic record");
        if (!isFilled(profile.getSchool())) missing.add("School");
        if (!isFilled(profile.getNesaGrade())) missing.add("Grade");
        if (!isFilled(profile.getNesaOption())) missing.add("Combination / option");
        if (!isFilled(profile.getGraduationYear())) missing.add("Graduation year");
        if (!isFilled(profile.getPhone())) missing.add("Phone number");
        if (profile.getUser() == null || !isFilled(profile.getUser().getEmail())) missing.add("Email");
        if (!isFilled(profile.getExperience())) missing.add("Work experience");
        if (!isFilled(profile.getSkills())) missing.add("Skills");
        if (!isFilled(profile.getProfessionalSummary())) missing.add("Professional summary");
        if (!isFilled(profile.getCvUrl())) missing.add("CV upload");
        if (!isFilled(profile.getDegreeUrl())) missing.add("Degree upload");
        if (!isFilled(profile.getCertificatesUrl())) missing.add("Certificates upload");
        if (!isFilled(profile.getSupportingDocumentUrl())) missing.add("Supporting document upload");

        return missing;
    }

    private ApplicantProfile uploadFile(Long userId, MultipartFile file, String folder, String label)
            throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(label + " file is required");
        }

        ApplicantProfile profile = getProfileByUserId(userId);
        String storedPath = storeFile(file, folder);

        switch (folder) {
            case "cvs" -> profile.setCvUrl(storedPath);
            case "degrees" -> profile.setDegreeUrl(storedPath);
            case "certificates" -> profile.setCertificatesUrl(storedPath);
            case "documents" -> profile.setSupportingDocumentUrl(storedPath);
            default -> throw new IllegalArgumentException("Unsupported upload type");
        }

        evaluateCompletion(profile);
        return profileRepository.save(profile);
    }

    private ApplicantProfile createEmptyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ApplicantProfile profile = new ApplicantProfile();
        profile.setUser(user);
        return profileRepository.save(profile);
    }

    private void applyRequest(ApplicantProfile profile, ProfileRequest request) {
        profile.setNationality(trim(request.getNationality()));
        profile.setNationalId(trim(request.getNationalId()));
        profile.setPhone(trim(request.getPhone()));
        profile.setAddress(trim(request.getAddress()));
        profile.setDistrict(trim(request.getDistrict()));
        profile.setSector(trim(request.getSector()));
        profile.setDateOfBirth(trim(request.getDateOfBirth()));
        profile.setGender(trim(request.getGender()));
        profile.setSchool(trim(request.getSchool()));
        profile.setGraduationYear(trim(request.getGraduationYear()));
        profile.setEducation(trim(request.getEducation()));
        profile.setNesaGrade(trim(request.getNesaGrade()));
        profile.setNesaOption(trim(request.getNesaOption()));
        profile.setExperience(trim(request.getExperience()));
        profile.setSkills(trim(request.getSkills()));
        profile.setProfessionalSummary(trim(request.getProfessionalSummary()));
        profile.setCertifications(trim(request.getCertifications()));
        profile.setNidVerified(request.isNidVerified());
        profile.setNesaVerified(request.isNesaVerified());
    }

    private void syncUserDetails(User user, ProfileRequest request) {
        if (isFilled(request.getFullName())) {
            user.setFullName(trim(request.getFullName()));
        }
        if (isFilled(request.getEmail())) {
            user.setEmail(trim(request.getEmail()));
        }
        userRepository.save(user);
    }

    private void evaluateCompletion(ApplicantProfile profile) {
        boolean rwandan = RWANDAN.equalsIgnoreCase(profile.getNationality());

        boolean identityComplete = isFilled(profile.getNationality())
                && isFilled(profile.getPhone())
                && isFilled(profile.getGender())
                && isFilled(profile.getDateOfBirth())
                && isFilled(profile.getDistrict())
                && isFilled(profile.getSector());

        boolean academicComplete = isFilled(profile.getSchool())
                && isFilled(profile.getNesaGrade())
                && isFilled(profile.getNesaOption())
                && isFilled(profile.getGraduationYear());

        boolean professionalComplete = isFilled(profile.getExperience())
                && isFilled(profile.getSkills())
                && isFilled(profile.getProfessionalSummary());

        boolean documentsComplete = isFilled(profile.getCvUrl())
                && isFilled(profile.getDegreeUrl())
                && isFilled(profile.getCertificatesUrl())
                && isFilled(profile.getSupportingDocumentUrl());

        boolean verificationComplete = rwandan
                ? profile.isNidVerified() && profile.isNesaVerified() && isFilled(profile.getNationalId())
                : true;

        boolean complete = identityComplete
                && academicComplete
                && professionalComplete
                && documentsComplete
                && verificationComplete;

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
