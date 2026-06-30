package com.anto.recruitment_system.repository;

import com.anto.recruitment_system.entity.Application;
import com.anto.recruitment_system.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByStatus(ApplicationStatus status);

    List<Application> findTop10ByOrderByCreatedAtDesc();
}
