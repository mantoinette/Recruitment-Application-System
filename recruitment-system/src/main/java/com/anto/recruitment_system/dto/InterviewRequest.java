package com.anto.recruitment_system.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InterviewRequest {

    private LocalDateTime scheduledAt;
    private String location;
    private String notes;
}
