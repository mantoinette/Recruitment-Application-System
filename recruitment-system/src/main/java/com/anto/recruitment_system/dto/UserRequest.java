package com.anto.recruitment_system.dto;

import com.anto.recruitment_system.entity.Role;
import lombok.Data;

@Data
public class UserRequest {

    private String fullName;
    private String email;
    private String password;
    private Role role;
}
