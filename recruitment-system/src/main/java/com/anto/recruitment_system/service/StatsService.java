package com.anto.recruitment_system.service;

import com.anto.recruitment_system.dto.ChartPoint;
import com.anto.recruitment_system.dto.DashboardStats;
import com.anto.recruitment_system.dto.DetailedStats;
import com.anto.recruitment_system.entity.Application;
import com.anto.recruitment_system.entity.ApplicationStatus;
import com.anto.recruitment_system.entity.JobStatus;
import com.anto.recruitment_system.entity.Role;
import com.anto.recruitment_system.repository.ApplicationRepository;
import com.anto.recruitment_system.repository.JobVacancyRepository;
import com.anto.recruitment_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
                applicationRepository.countValid(),
                applicationRepository.countValidByStatus(ApplicationStatus.PENDING),
                applicationRepository.countValidByStatus(ApplicationStatus.UNDER_REVIEW),
                applicationRepository.countValidByStatus(ApplicationStatus.INTERVIEW),
                applicationRepository.countValidByStatus(ApplicationStatus.APPROVED),
                applicationRepository.countValidByStatus(ApplicationStatus.REJECTED),
                userRepository.count(),
                userRepository.countByRole(Role.APPLICANT),
                userRepository.countByRole(Role.HR),
                userRepository.countByRole(Role.ADMIN),
                jobVacancyRepository.countByStatus(JobStatus.OPEN),
                jobVacancyRepository.countByStatus(JobStatus.CLOSED)
        );
    }

    public DetailedStats getDetailedStats() {
        DashboardStats summary = getDashboardStats();

        List<ChartPoint> applicationStatusChart = List.of(
                new ChartPoint("Pending", summary.getPendingApplications()),
                new ChartPoint("Under Review", summary.getUnderReviewApplications()),
                new ChartPoint("Interview", summary.getInterviewApplications()),
                new ChartPoint("Approved", summary.getApprovedApplications()),
                new ChartPoint("Rejected", summary.getRejectedApplications())
        );

        List<ChartPoint> userRoleChart = List.of(
                new ChartPoint("Applicants", summary.getApplicantUsers()),
                new ChartPoint("HR", summary.getHrUsers()),
                new ChartPoint("Admins", summary.getAdminUsers())
        );

        List<ChartPoint> vacancyChart = List.of(
                new ChartPoint("Open", summary.getOpenJobs()),
                new ChartPoint("Closed", summary.getClosedJobs())
        );

        return new DetailedStats(
                summary,
                applicationStatusChart,
                userRoleChart,
                buildMonthlyApplicationsChart(),
                vacancyChart
        );
    }

    private List<ChartPoint> buildMonthlyApplicationsChart() {
        Map<String, Long> monthlyCounts = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = LocalDateTime.now().minusMonths(i).withDayOfMonth(1);
            monthlyCounts.put(month.format(formatter), 0L);
        }

        for (Application application : applicationRepository.findAllValidForStats()) {
            if (application.getCreatedAt() == null) {
                continue;
            }

            String key = application.getCreatedAt().withDayOfMonth(1).format(formatter);
            if (monthlyCounts.containsKey(key)) {
                monthlyCounts.put(key, monthlyCounts.get(key) + 1);
            }
        }

        List<ChartPoint> chartPoints = new ArrayList<>();
        monthlyCounts.forEach((name, value) -> chartPoints.add(new ChartPoint(name, value)));
        return chartPoints;
    }
}
