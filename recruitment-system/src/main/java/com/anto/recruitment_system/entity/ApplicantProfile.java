package com.anto.recruitment_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "applicant_profiles")
public class ApplicantProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String nationality;
    private String nationalId;
    private String phone;
    private String address;
    private String district;
    private String sector;
    private String dateOfBirth;
    private String gender;
    private String school;
    private String graduationYear;
    private String education;
    private String nesaGrade;
    private String nesaOption;
    private String experience;

    @Column(length = 2000)
    private String skills;

    @Column(length = 2000)
    private String professionalSummary;

    @Column(length = 2000)
    private String certifications;

    private String cvUrl;
    private String degreeUrl;
    private String certificatesUrl;
    private String supportingDocumentUrl;

    private boolean nidVerified;
    private boolean nesaVerified;
    private boolean profileComplete;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
