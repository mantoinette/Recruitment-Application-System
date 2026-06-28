package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.dto.LoginRequest;
import com.anto.recruitment_system.dto.LoginResponse;
import com.anto.recruitment_system.dto.RegisterRequest;
import com.anto.recruitment_system.entity.User;
import com.anto.recruitment_system.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {

        this.authService = authService;
    }


     // Register new applicant

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        return ResponseEntity.ok(user);
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(

                request.getEmail(),

                request.getPassword()

        );

        return ResponseEntity.ok(response);
    }

    /**
     * Handle validation errors
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleException(
            IllegalArgumentException exception) {

        return ResponseEntity
                .badRequest()
                .body(exception.getMessage());
    }

}