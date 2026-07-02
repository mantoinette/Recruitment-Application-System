package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.service.SystemSettingsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/settings")
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    public SystemSettingsController(SystemSettingsService systemSettingsService) {
        this.systemSettingsService = systemSettingsService;
    }

    @GetMapping
    public Map<String, String> getSettings() {
        return systemSettingsService.getAllSettings();
    }

    @PutMapping
    public Map<String, String> updateSettings(@RequestBody Map<String, String> settings) {
        return systemSettingsService.updateSettings(settings);
    }
}
