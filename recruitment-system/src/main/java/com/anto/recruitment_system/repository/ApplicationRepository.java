package com.anto.recruitment_system.repository;

import com.anto.recruitment_system.entity.Application;
import com.anto.recruitment_system.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    @EntityGraph(attributePaths = {"user", "job"})
    @Query("SELECT a FROM Application a WHERE a.user IS NOT NULL AND a.job IS NOT NULL ORDER BY a.createdAt DESC")
    List<Application> findAllValidWithUserAndJob();

    @EntityGraph(attributePaths = {"user", "job"})
    List<Application> findTop10ByUserIsNotNullAndJobIsNotNullOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"user", "job"})
    List<Application> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "job"})
    @Query("SELECT a FROM Application a WHERE a.id = :id AND a.user IS NOT NULL AND a.job IS NOT NULL")
    Optional<Application> findValidDetailedById(@Param("id") Long id);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.user IS NOT NULL AND a.job IS NOT NULL")
    long countValid();

    @Query("SELECT COUNT(a) FROM Application a WHERE a.user IS NOT NULL AND a.job IS NOT NULL AND a.status = :status")
    long countValidByStatus(@Param("status") ApplicationStatus status);

    @Query("""
            SELECT a FROM Application a
            WHERE a.user IS NOT NULL AND a.job IS NOT NULL AND a.createdAt IS NOT NULL
            ORDER BY a.createdAt DESC
            """)
  List<Application> findAllValidForStats();
}
