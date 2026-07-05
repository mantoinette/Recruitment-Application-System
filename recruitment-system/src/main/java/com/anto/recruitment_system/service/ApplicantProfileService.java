package com.anto.recruitment_system.service;

import com.anto.recruitment_system.dto.AcademicBackgroundRequest;
import com.anto.recruitment_system.dto.ProfileRequest;
import com.anto.recruitment_system.entity.AcademicBackground;
import com.anto.recruitment_system.entity.ApplicantProfile;
import com.anto.recruitment_system.entity.EducationLevel;
import com.anto.recruitment_system.entity.User;
import com.anto.recruitment_system.repository.ApplicantProfileRepository;
import com.anto.recruitment_system.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ApplicantProfileService {

    private static final String RWANDA = "Rwanda";

    private final ApplicantProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ApplicantProfileService(ApplicantProfileRepository profileRepository,
                                   UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public ApplicantProfile getProfileByUserId(Long userId) {
        ApplicantProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> createEmptyProfile(userId));
        return refreshCompletionState(profile);
    }

    public ApplicantProfile saveProfile(Long userId, ProfileRequest request) {
        ApplicantProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> createEmptyProfile(userId));
        applyRequest(profile, request);
        syncUserDetails(profile.getUser(), request);
        return refreshCompletionState(profile);
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

    public List<String> getMissingRequirements(Long userId) {
        ApplicantProfile profile = getProfileByUserId(userId);
        return getMissingRequirements(profile);
    }

    private ApplicantProfile refreshCompletionState(ApplicantProfile profile) {
        syncProfileReferences(profile);
        evaluateCompletion(profile);
        profile.setNesaVerified(calculateNesaVerified(profile));
        return profileRepository.save(profile);
    }

    private void syncProfileReferences(ApplicantProfile profile) {
        if (profile.getAcademicBackgrounds() == null) {
            return;
        }

        for (AcademicBackground background : profile.getAcademicBackgrounds()) {
            background.setProfile(profile);
        }
    }

    private List<String> getMissingRequirements(ApplicantProfile profile) {
        List<String> missing = new ArrayList<>();
        boolean rwandan = isRwandan(profile.getNationality());

        if (!isFilled(profile.getNationality())) missing.add("Country");
        if (rwandan && !profile.isNidVerified()) missing.add("NID verification");
        if (rwandan && !isFilled(profile.getNationalId())) missing.add("National ID");
        if (!isFilled(profile.getUser() != null ? profile.getUser().getFullName() : null)) missing.add("Full name");
        if (!isFilled(profile.getGender())) missing.add("Gender");
        if (!isFilled(profile.getDateOfBirth())) missing.add("Date of birth");
        if (!isFilled(profile.getDistrict())) missing.add("District");
        if (!isFilled(profile.getSector())) missing.add("Sector");

        if (profile.getHighestEducationLevel() == null) {
            missing.add("Highest education level");
        }

        List<AcademicBackground> backgrounds = profile.getAcademicBackgrounds();
        if (backgrounds == null || backgrounds.isEmpty()) {
            missing.add("At least one academic background");
        } else {
            for (int index = 0; index < backgrounds.size(); index++) {
                AcademicBackground background = backgrounds.get(index);
                String label = educationLabel(background.getLevel()) + " background #" + (index + 1);
                if (background.getLevel() == null) {
                    missing.add(label + " level");
                    continue;
                }
                if (isNesaLevel(background.getLevel())) {
                    if (rwandan && !background.isNesaVerified()) {
                        missing.add(label + " NESA verification");
                    }
                    if (!isFilled(background.getSchoolName())) missing.add(label + " school");
                    if (!isFilled(background.getGraduationYear())) missing.add(label + " completion year");
                    if (!isFilled(background.getGrade())) missing.add(label + " grade");
                    if (!isFilled(background.getOption())) missing.add(label + " combination");
                } else {
                    if (!isFilled(background.getSchoolName())) missing.add(label + " institution");
                    if (!isFilled(background.getGraduationYear())) missing.add(label + " completion year");
                }
            }
        }

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

        ApplicantProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> createEmptyProfile(userId));
        String storedPath = storeFile(file, folder);

        switch (folder) {
            case "cvs" -> profile.setCvUrl(storedPath);
            case "degrees" -> profile.setDegreeUrl(storedPath);
            case "certificates" -> profile.setCertificatesUrl(storedPath);
            case "documents" -> profile.setSupportingDocumentUrl(storedPath);
            default -> throw new IllegalArgumentException("Unsupported upload type");
        }

        return refreshCompletionState(profile);
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
        profile.setHighestEducationLevel(request.getHighestEducationLevel());
        applyAcademicBackgrounds(profile, request.getAcademicBackgrounds());
        syncLegacyEducationFields(profile);

        profile.setExperience(trim(request.getExperience()));
        profile.setSkills(trim(request.getSkills()));
        profile.setProfessionalSummary(trim(request.getProfessionalSummary()));
        profile.setCertifications(trim(request.getCertifications()));
        profile.setNidVerified(request.isNidVerified());
        profile.setNesaVerified(calculateNesaVerified(profile));
    }

    private void applyAcademicBackgrounds(ApplicantProfile profile, List<AcademicBackgroundRequest> requests) {
        profile.getAcademicBackgrounds().clear();

        if (requests == null) {
            return;
        }

        for (AcademicBackgroundRequest request : requests) {
            if (request == null || request.getLevel() == null) {
                continue;
            }

            AcademicBackground background = new AcademicBackground();
            background.setProfile(profile);
            background.setLevel(request.getLevel());
            background.setSchoolName(trim(request.getSchoolName()));
            background.setGraduationYear(trim(request.getGraduationYear()));
            background.setGrade(trim(request.getGrade()));
            background.setOption(trim(request.getOption()));
            background.setNesaVerified(request.isNesaVerified());
            profile.getAcademicBackgrounds().add(background);
        }
    }

    private void syncLegacyEducationFields(ApplicantProfile profile) {
        AcademicBackground source = profile.getAcademicBackgrounds().stream()
                .filter(background -> background.getLevel() == EducationLevel.HIGH_SCHOOL)
                .findFirst()
                .orElseGet(() -> profile.getAcademicBackgrounds().stream()
                        .filter(background -> background.getLevel() == EducationLevel.PRIMARY)
                        .findFirst()
                        .orElse(null));

        if (source == null) {
            return;
        }

        profile.setSchool(source.getSchoolName());
        profile.setGraduationYear(source.getGraduationYear());
        profile.setNesaGrade(source.getGrade());
        profile.setNesaOption(source.getOption());
        profile.setEducation(isFilled(source.getSchoolName())
                ? source.getSchoolName() + " (" + (source.getGraduationYear() != null ? source.getGraduationYear() : "N/A") + ")"
                : null);
    }

    private boolean calculateNesaVerified(ApplicantProfile profile) {
        if (!isRwandan(profile.getNationality())) {
            return true;
        }

        List<AcademicBackground> nesaBackgrounds = profile.getAcademicBackgrounds().stream()
                .filter(background -> isNesaLevel(background.getLevel()))
                .toList();

        if (nesaBackgrounds.isEmpty()) {
            return true;
        }

        return nesaBackgrounds.stream().allMatch(AcademicBackground::isNesaVerified);
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
        boolean rwandan = isRwandan(profile.getNationality());

        boolean identityComplete = isFilled(profile.getNationality())
                && isFilled(profile.getPhone())
                && isFilled(profile.getGender())
                && isFilled(profile.getDateOfBirth())
                && isFilled(profile.getDistrict())
                && isFilled(profile.getSector());

        boolean academicComplete = profile.getHighestEducationLevel() != null
                && !profile.getAcademicBackgrounds().isEmpty()
                && profile.getAcademicBackgrounds().stream()
                .allMatch(background -> isBackgroundComplete(background, profile));

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

        profile.setProfileComplete(identityComplete
                && academicComplete
                && professionalComplete
                && documentsComplete
                && verificationComplete);
    }

    private boolean isBackgroundComplete(AcademicBackground background, ApplicantProfile profile) {
        if (background.getLevel() == null) {
            return false;
        }

        if (isNesaLevel(background.getLevel())) {
            boolean rwandan = isRwandan(profile.getNationality());
            boolean nesaOk = !rwandan || background.isNesaVerified();
            return nesaOk
                    && isFilled(background.getSchoolName())
                    && isFilled(background.getGraduationYear())
                    && isFilled(background.getGrade())
                    && isFilled(background.getOption());
        }

        return isFilled(background.getSchoolName()) && isFilled(background.getGraduationYear());
    }

    private boolean isRwandan(String nationality) {
        if (nationality == null || nationality.isBlank()) {
            return false;
        }
        String value = nationality.trim();
        return RWANDA.equalsIgnoreCase(value) || "RWANDAN".equalsIgnoreCase(value);
    }

    private boolean isNesaLevel(EducationLevel level) {
        return level == EducationLevel.PRIMARY || level == EducationLevel.HIGH_SCHOOL;
    }

    private String educationLabel(EducationLevel level) {
        if (level == null) {
            return "Academic";
        }
        return switch (level) {
            case PRIMARY -> "Primary";
            case HIGH_SCHOOL -> "High school";
            case UNIVERSITY -> "University";
            case MASTERS -> "Masters";
            case PHD_DOCTORAL -> "PhD / Doctoral";
        };
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
