package com.anto.recruitment_system.dto;

import lombok.Data;

@Data
public class ProfileRequest {

    private String nationality;
    private String fullName;
    private String email;
    private String nationalId;
    private String phone;
    private String address;
    private String district;
    private String sector;
    private String dateOfBirth;
    private String gender;
    private String school;
    private String graduationYear;
    private String education;
    private String nesaGrade;
    private String nesaOption;
    private String experience;
    private String skills;
    private String professionalSummary;
    private String certifications;
    private boolean nidVerified;
    private boolean nesaVerified;
}
