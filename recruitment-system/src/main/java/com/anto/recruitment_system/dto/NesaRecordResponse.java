package com.anto.recruitment_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NesaRecordResponse {

    private String nationalId;
    private String candidateName;
    private String grade;
    private String option;
    private String school;
    private String year;
    private String message;
}
