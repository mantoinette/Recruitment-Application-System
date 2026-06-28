package com.anto.recruitment_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String phone;
    private String address;
    private String education;
    private String experience;
    private String cvUrl;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;
    private String rejectionReason;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}