package com.anto.recruitment_system.dto;

import com.anto.recruitment_system.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String message;
}
