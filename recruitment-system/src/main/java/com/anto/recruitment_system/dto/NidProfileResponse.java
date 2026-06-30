package com.anto.recruitment_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NidProfileResponse {

    private String nationalId;
    private String fullName;
    private String dateOfBirth;
    private String gender;
    private String address;
    private String message;
}
