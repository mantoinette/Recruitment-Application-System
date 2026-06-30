package com.anto.recruitment_system.repository;

import com.anto.recruitment_system.entity.ApplicantProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicantProfileRepository extends JpaRepository<ApplicantProfile, Long> {

    Optional<ApplicantProfile> findByUserId(Long userId);
}
