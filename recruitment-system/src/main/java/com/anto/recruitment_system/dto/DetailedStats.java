package com.anto.recruitment_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DetailedStats {

    private DashboardStats summary;
    private List<ChartPoint> applicationStatusChart;
    private List<ChartPoint> userRoleChart;
    private List<ChartPoint> monthlyApplicationsChart;
    private List<ChartPoint> vacancyChart;
}
