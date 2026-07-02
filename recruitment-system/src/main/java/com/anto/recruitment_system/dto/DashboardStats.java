package com.anto.recruitment_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStats {

    private long totalApplications;
    private long pendingApplications;
    private long underReviewApplications;
    private long interviewApplications;
    private long approvedApplications;
    private long rejectedApplications;
    private long totalUsers;
    private long applicantUsers;
    private long hrUsers;
    private long adminUsers;
    private long openJobs;
    private long closedJobs;
}
