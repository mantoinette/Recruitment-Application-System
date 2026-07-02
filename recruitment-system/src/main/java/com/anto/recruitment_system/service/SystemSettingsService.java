package com.anto.recruitment_system.service;

import com.anto.recruitment_system.entity.SystemSetting;
import com.anto.recruitment_system.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SystemSettingsService {

    private final SystemSettingRepository systemSettingRepository;

    public SystemSettingsService(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }

    public Map<String, String> getAllSettings() {
        Map<String, String> settings = new HashMap<>();
        for (SystemSetting setting : systemSettingRepository.findAll()) {
            settings.put(setting.getSettingKey(), setting.getSettingValue());
        }
        return settings;
    }

    public Map<String, String> updateSettings(Map<String, String> updates) {
        updates.forEach((key, value) -> {
            SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                    .orElseGet(() -> {
                        SystemSetting created = new SystemSetting();
                        created.setSettingKey(key);
                        return created;
                    });
            setting.setSettingValue(value);
            systemSettingRepository.save(setting);
        });

        return getAllSettings();
    }

    public void seedDefaults() {
        saveIfMissing("company_name", "RecruitPro");
        saveIfMissing("support_email", "careers@recruitpro.rw");
        saveIfMissing("support_phone", "+250 788 000 000");
        saveIfMissing("head_office", "Kigali, Rwanda");
        saveIfMissing("default_application_deadline_days", "30");
    }

    private void saveIfMissing(String key, String value) {
        if (systemSettingRepository.findBySettingKey(key).isEmpty()) {
            SystemSetting setting = new SystemSetting();
            setting.setSettingKey(key);
            setting.setSettingValue(value);
            systemSettingRepository.save(setting);
        }
    }
}
