package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.entity.Application;
import com.anto.recruitment_system.service.ApplicationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // Create application
    @PostMapping
    public Application submitApplication(@RequestBody Application application) {
        return applicationService.submitApplication(application);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Application submitApplicationWithCv(
            @RequestParam Long userId,
            @RequestParam String phone,
            @RequestParam String address,
            @RequestParam String education,
            @RequestParam String experience,
            @RequestParam("file") MultipartFile file) throws IOException {

        return applicationService.submitApplicationWithCv(
                userId,
                phone,
                address,
                education,
                experience,
                file
        );
    }

    // Get all applications
    @GetMapping
    public List<Application> getAllApplications() {
        return applicationService.getAllApplications();
    }

    // Get application by id
    @GetMapping("/{id}")
    public Application getApplicationById(@PathVariable Long id) {
        return applicationService.getApplicationById(id);
    }

    // Delete application
    @DeleteMapping("/{id}")
    public String deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return "Application deleted successfully";
    }

    // Upload CV

    @PostMapping("/upload")
    public String uploadCv(@RequestParam("file") MultipartFile file) {
        return "Uploaded: " + file.getOriginalFilename();
    }
    @PutMapping("/{id}/approve")
    public Application approveApplication(@PathVariable Long id) {

        return applicationService.approveApplication(id);
    }
    @PutMapping("/{id}/reject")
    public Application rejectApplication(
            @PathVariable Long id,
            @RequestParam String reason) {

        return applicationService.rejectApplication(id, reason);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }
}
