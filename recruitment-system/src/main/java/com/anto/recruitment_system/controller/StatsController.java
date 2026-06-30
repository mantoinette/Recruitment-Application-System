package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.dto.DashboardStats;
import com.anto.recruitment_system.service.StatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public DashboardStats getDashboardStats() {
        return statsService.getDashboardStats();
    }
}
