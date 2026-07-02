package com.anto.recruitment_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nationalId;
    private String phone;
    private String address;
    private String education;
    private String nesaGrade;
    private String nesaOption;
    private String positionApplied;
    private String experience;
    private String cvUrl;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private String rejectionReason;

    private LocalDateTime interviewScheduledAt;
    private String interviewLocation;
    private String interviewNotes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private JobVacancy job;
}