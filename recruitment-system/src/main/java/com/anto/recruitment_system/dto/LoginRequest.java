package com.anto.recruitment_system.dto;

import lombok.Data;

@Data
public class LoginRequest {

    private String email;
    private String password;
}