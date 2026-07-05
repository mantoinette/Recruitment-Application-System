package com.anto.recruitment_system.dto;

import com.anto.recruitment_system.entity.EducationLevel;
import lombok.Data;

@Data
public class AcademicBackgroundRequest {

    private Long id;
    private EducationLevel level;
    private String schoolName;
    private String graduationYear;
    private String grade;
    private String option;
    private boolean nesaVerified;
}
