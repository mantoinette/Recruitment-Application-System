package com.anto.recruitment_system.dto;

import lombok.Data;

@Data
public class ProfileRequest {

    private String nationalId;
    private String phone;
    private String address;
    private String dateOfBirth;
    private String gender;
    private String education;
    private String nesaGrade;
    private String nesaOption;
    private String experience;
    private String skills;
    private String certifications;
    private boolean nidVerified;
    private boolean nesaVerified;
}
