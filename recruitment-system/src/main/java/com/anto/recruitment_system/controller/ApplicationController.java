package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.dto.InterviewRequest;
import com.anto.recruitment_system.entity.Application;
import com.anto.recruitment_system.entity.ApplicationStatus;
import com.anto.recruitment_system.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/apply")
    public Application applyForJob(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long jobId = request.get("jobId");

        if (userId == null || jobId == null) {
            throw new IllegalArgumentException("User ID and Job ID are required");
        }

        return applicationService.applyForJob(userId, jobId);
    }

    @GetMapping
    public List<Application> getAllApplications() {
        return applicationService.getAllApplications();
    }

    @GetMapping("/user/{userId}")
    public List<Application> getApplicationsByUser(@PathVariable Long userId) {
        return applicationService.getApplicationsByUser(userId);
    }

    @GetMapping("/hr/latest")
    public List<Application> getLatestApplicationsForHr() {
        return applicationService.getLatestTenSortedAlphabetically();
    }

    @GetMapping("/hr/all")
    public List<Application> getAllApplicationsForHr(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return applicationService.getAllSortedAlphabetically(search, status);
    }

    @GetMapping("/hr/interviews")
    public List<Application> getInterviewApplications() {
        return applicationService.getInterviewApplications();
    }

    @GetMapping("/hr/approved")
    public List<Application> getApprovedApplications() {
        return applicationService.getApprovedApplications();
    }

    @GetMapping("/{id}")
    public Application getApplicationById(@PathVariable Long id) {
        return applicationService.getApplicationById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return "Application deleted successfully";
    }

    @PutMapping("/{id}/review")
    public Application reviewApplication(@PathVariable Long id) {
        return applicationService.reviewApplication(id);
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

    @PutMapping("/{id}/status")
    public Application updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return applicationService.updateStatus(id, ApplicationStatus.valueOf(status));
    }

    @PutMapping("/{id}/interview")
    public Application scheduleInterview(
            @PathVariable Long id,
            @RequestBody InterviewRequest request) {
        return applicationService.scheduleInterview(id, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }
}
