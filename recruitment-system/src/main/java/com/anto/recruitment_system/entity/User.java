package com.anto.recruitment_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor // Creates empty constructor
@Entity // Marks this class as a database table
@Table(name = "users") // Table name in PostgreSQL
public class User {

    @Id // Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;
    private String fullName;
    @Column(unique = true) // Email must be unique
    private String email;
    private String password;

    @Enumerated(EnumType.STRING) // Stores role as text
    private Role role;
}