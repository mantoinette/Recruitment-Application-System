package com.anto.recruitment_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "job_vacancies")
public class JobVacancy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String department;
    private String location;
    private String employmentType;

    @Column(length = 500)
    private String shortDescription;

    @Column(length = 4000)
    private String fullDescription;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.OPEN;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
