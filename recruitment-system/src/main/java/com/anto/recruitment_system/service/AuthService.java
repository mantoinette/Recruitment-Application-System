package com.anto.recruitment_system.service;

import com.anto.recruitment_system.dto.LoginResponse;
import com.anto.recruitment_system.dto.RegisterRequest;
import com.anto.recruitment_system.entity.Role;
import com.anto.recruitment_system.entity.User;
import com.anto.recruitment_system.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    // Repository used to communicate with the database
    private final UserRepository userRepository;

    // Used to encrypt and verify passwords
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public User register(RegisterRequest request) {

        // Validate Full Name
        if (request.getFullName() == null ||
                request.getFullName().isBlank()) {

            throw new IllegalArgumentException(
                    "Full name is required"
            );
        }

        // Validate Email
        if (request.getEmail() == null ||
                request.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        // Validate Password
        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        // Convert email to lowercase
        String email = request.getEmail()
                .trim()
                .toLowerCase();

        // Check whether email already exists
        if (userRepository.findByEmail(email).isPresent()) {

            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        // Create User object
        User user = new User();

        user.setFullName(
                request.getFullName().trim()
        );

        user.setEmail(email);

        // Encrypt password before saving
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        // Assign selected role (defaults to applicant)
        user.setRole(request.getRole() == null ? Role.APPLICANT : request.getRole());

        // Save into database
        return userRepository.save(user);
    }

    /**
     * Login user
     */
    public LoginResponse login(String email,
                               String password) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (password == null || password.isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        // Search user by email
        User user = userRepository.findByEmail(
                        email.trim().toLowerCase())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"));

        // Compare entered password
        // with encrypted password
        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid password");
        }

        if (!user.isActive()) {
            throw new IllegalArgumentException(
                    "Your account has been deactivated. Contact the administrator.");
        }

        // Return only the data needed by frontend
        return new LoginResponse(

                user.getId(),

                user.getFullName(),

                user.getEmail(),

                user.getRole(),

                "Login successful"

        );
    }

}