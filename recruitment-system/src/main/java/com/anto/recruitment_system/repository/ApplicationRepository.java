package com.anto.recruitment_system.repository;

import com.anto.recruitment_system.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Application save(Application application);

    List<Application> findAll();

    Optional<Application> findById(Long id);

    void deleteById(Long id);
}