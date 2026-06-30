package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.entity.JobVacancy;
import com.anto.recruitment_system.service.JobVacancyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobVacancyController {

    private final JobVacancyService jobVacancyService;

    public JobVacancyController(JobVacancyService jobVacancyService) {
        this.jobVacancyService = jobVacancyService;
    }

    @GetMapping("/open")
    public List<JobVacancy> getOpenJobs() {
        return jobVacancyService.getOpenJobs();
    }

    @GetMapping
    public List<JobVacancy> getAllJobs() {
        return jobVacancyService.getAllJobs();
    }

    @GetMapping("/{id}")
    public JobVacancy getJobById(@PathVariable Long id) {
        return jobVacancyService.getJobById(id);
    }

    @PostMapping
    public JobVacancy createJob(@RequestBody JobVacancy jobVacancy) {
        return jobVacancyService.createJob(jobVacancy);
    }

    @PutMapping("/{id}")
    public JobVacancy updateJob(@PathVariable Long id, @RequestBody JobVacancy jobVacancy) {
        return jobVacancyService.updateJob(id, jobVacancy);
    }

    @DeleteMapping("/{id}")
    public String deleteJob(@PathVariable Long id) {
        jobVacancyService.deleteJob(id);
        return "Job vacancy deleted successfully";
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }
}
