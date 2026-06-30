package com.anto.recruitment_system.repository;

import com.anto.recruitment_system.entity.JobStatus;
import com.anto.recruitment_system.entity.JobVacancy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobVacancyRepository extends JpaRepository<JobVacancy, Long> {

    List<JobVacancy> findByStatusOrderByCreatedAtDesc(JobStatus status);

    long countByStatus(JobStatus status);
}
