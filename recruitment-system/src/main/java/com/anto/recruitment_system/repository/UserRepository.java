package com.anto.recruitment_system.repository;

import com.anto.recruitment_system.entity.User;
import com.anto.recruitment_system.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    long countByRole(Role role);
}