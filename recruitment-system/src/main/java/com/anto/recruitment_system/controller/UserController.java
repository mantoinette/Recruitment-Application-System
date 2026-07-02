package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.dto.ResetPasswordRequest;
import com.anto.recruitment_system.dto.UserRequest;
import com.anto.recruitment_system.entity.User;
import com.anto.recruitment_system.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User createUser(@RequestBody UserRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
        return userService.updateUser(id, request);
    }

    @PatchMapping("/{id}/active")
    public User setUserActive(@PathVariable Long id, @RequestParam boolean active) {
        return userService.setUserActive(id, active);
    }

    @PutMapping("/{id}/reset-password")
    public User resetPassword(@PathVariable Long id, @RequestBody ResetPasswordRequest request) {
        return userService.resetPassword(id, request);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "User deleted successfully";
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }
}
