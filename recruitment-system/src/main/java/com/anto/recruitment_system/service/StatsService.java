package com.anto.recruitment_system.service;

import com.anto.recruitment_system.dto.DashboardStats;
import com.anto.recruitment_system.entity.ApplicationStatus;
import com.anto.recruitment_system.entity.JobStatus;
import com.anto.recruitment_system.entity.Role;
import com.anto.recruitment_system.repository.ApplicationRepository;
import com.anto.recruitment_system.repository.JobVacancyRepository;
import com.anto.recruitment_system.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobVacancyRepository jobVacancyRepository;

    public StatsService(ApplicationRepository applicationRepository,
                        UserRepository userRepository,
                        JobVacancyRepository jobVacancyRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobVacancyRepository = jobVacancyRepository;
    }

    public DashboardStats getDashboardStats() {
        return new DashboardStats(
                applicationRepository.count(),
                applicationRepository.countByStatus(ApplicationStatus.PENDING),
                applicationRepository.countByStatus(ApplicationStatus.REVIEWED),
                applicationRepository.countByStatus(ApplicationStatus.APPROVED),
                applicationRepository.countByStatus(ApplicationStatus.REJECTED),
                userRepository.count(),
                userRepository.countByRole(Role.APPLICANT),
                userRepository.countByRole(Role.HR),
                userRepository.countByRole(Role.ADMIN),
                jobVacancyRepository.countByStatus(JobStatus.OPEN),
                jobVacancyRepository.countByStatus(JobStatus.CLOSED)
        );
    }
}
