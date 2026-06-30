package com.anto.recruitment_system.service;

import com.anto.recruitment_system.entity.JobStatus;
import com.anto.recruitment_system.entity.JobVacancy;
import com.anto.recruitment_system.repository.JobVacancyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobVacancyService {

    private final JobVacancyRepository jobVacancyRepository;

    public JobVacancyService(JobVacancyRepository jobVacancyRepository) {
        this.jobVacancyRepository = jobVacancyRepository;
    }

    public List<JobVacancy> getOpenJobs() {
        return jobVacancyRepository.findByStatusOrderByCreatedAtDesc(JobStatus.OPEN);
    }

    public List<JobVacancy> getAllJobs() {
        return jobVacancyRepository.findAll();
    }

    public JobVacancy getJobById(Long id) {
        return jobVacancyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job vacancy not found"));
    }

    public JobVacancy createJob(JobVacancy jobVacancy) {
        validateJob(jobVacancy);
        if (jobVacancy.getStatus() == null) {
            jobVacancy.setStatus(JobStatus.OPEN);
        }
        return jobVacancyRepository.save(jobVacancy);
    }

    public JobVacancy updateJob(Long id, JobVacancy updatedJob) {
        JobVacancy existing = getJobById(id);
        validateJob(updatedJob);

        existing.setTitle(updatedJob.getTitle());
        existing.setDepartment(updatedJob.getDepartment());
        existing.setLocation(updatedJob.getLocation());
        existing.setEmploymentType(updatedJob.getEmploymentType());
        existing.setShortDescription(updatedJob.getShortDescription());
        existing.setFullDescription(updatedJob.getFullDescription());
        existing.setDeadline(updatedJob.getDeadline());
        existing.setStatus(updatedJob.getStatus());

        return jobVacancyRepository.save(existing);
    }

    public void deleteJob(Long id) {
        jobVacancyRepository.deleteById(id);
    }

    private void validateJob(JobVacancy jobVacancy) {
        if (jobVacancy.getTitle() == null || jobVacancy.getTitle().isBlank()) {
            throw new IllegalArgumentException("Job title is required");
        }
        if (jobVacancy.getDepartment() == null || jobVacancy.getDepartment().isBlank()) {
            throw new IllegalArgumentException("Department is required");
        }
        if (jobVacancy.getLocation() == null || jobVacancy.getLocation().isBlank()) {
            throw new IllegalArgumentException("Location is required");
        }
        if (jobVacancy.getEmploymentType() == null || jobVacancy.getEmploymentType().isBlank()) {
            throw new IllegalArgumentException("Employment type is required");
        }
        if (jobVacancy.getShortDescription() == null || jobVacancy.getShortDescription().isBlank()) {
            throw new IllegalArgumentException("Short description is required");
        }
        if (jobVacancy.getFullDescription() == null || jobVacancy.getFullDescription().isBlank()) {
            throw new IllegalArgumentException("Full description is required");
        }
        if (jobVacancy.getDeadline() == null) {
            throw new IllegalArgumentException("Application deadline is required");
        }
    }
}
