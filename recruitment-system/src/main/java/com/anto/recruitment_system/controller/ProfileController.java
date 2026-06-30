package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.dto.ProfileRequest;
import com.anto.recruitment_system.entity.ApplicantProfile;
import com.anto.recruitment_system.service.ApplicantProfileService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final ApplicantProfileService profileService;

    public ProfileController(ApplicantProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{userId}")
    public ApplicantProfile getProfile(@PathVariable Long userId) {
        return profileService.getProfileByUserId(userId);
    }

    @GetMapping("/{userId}/status")
    public Map<String, Object> getProfileStatus(@PathVariable Long userId) {
        ApplicantProfile profile = profileService.getProfileByUserId(userId);
        return Map.of(
                "profileComplete", profile.isProfileComplete(),
                "nidVerified", profile.isNidVerified(),
                "nesaVerified", profile.isNesaVerified()
        );
    }

    @PutMapping("/{userId}")
    public ApplicantProfile saveProfile(@PathVariable Long userId, @RequestBody ProfileRequest request) {
        return profileService.saveProfile(userId, request);
    }

    @PostMapping(value = "/{userId}/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApplicantProfile uploadCv(@PathVariable Long userId, @RequestParam("file") MultipartFile file)
            throws IOException {
        return profileService.uploadCv(userId, file);
    }

    @PostMapping(value = "/{userId}/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApplicantProfile uploadDocument(@PathVariable Long userId, @RequestParam("file") MultipartFile file)
            throws IOException {
        return profileService.uploadSupportingDocument(userId, file);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }
}
