package com.anto.recruitment_system.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "academic_backgrounds")
public class AcademicBackground {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    @JsonIgnore
    private ApplicantProfile profile;

    @Enumerated(EnumType.STRING)
    private EducationLevel level;

    private String schoolName;
    private String graduationYear;
    private String grade;
    private String option;

    private boolean nesaVerified;
}
