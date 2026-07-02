package com.anto.recruitment_system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class DatabaseSchemaPatcher implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaPatcher(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("""
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE
                """);
        jdbcTemplate.execute("""
                UPDATE users SET active = TRUE WHERE active IS NULL
                """);
        jdbcTemplate.execute("""
                ALTER TABLE users
                ALTER COLUMN active SET NOT NULL
                """);
        jdbcTemplate.execute("""
                ALTER TABLE users
                ALTER COLUMN active SET DEFAULT TRUE
                """);

        jdbcTemplate.execute("""
                ALTER TABLE applications
                ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMP
                """);

        jdbcTemplate.execute("""
                ALTER TABLE applications
                ADD COLUMN IF NOT EXISTS interview_location VARCHAR(255)
                """);

        jdbcTemplate.execute("""
                ALTER TABLE applications
                ADD COLUMN IF NOT EXISTS interview_notes VARCHAR(1000)
                """);

        jdbcTemplate.execute("""
                UPDATE applications
                SET status = 'UNDER_REVIEW'
                WHERE status = 'REVIEWED'
                """);

        jdbcTemplate.execute("""
                ALTER TABLE applicant_profiles
                ADD COLUMN IF NOT EXISTS nationality VARCHAR(50)
                """);
        jdbcTemplate.execute("""
                ALTER TABLE applicant_profiles
                ADD COLUMN IF NOT EXISTS district VARCHAR(255)
                """);
        jdbcTemplate.execute("""
                ALTER TABLE applicant_profiles
                ADD COLUMN IF NOT EXISTS sector VARCHAR(255)
                """);
        jdbcTemplate.execute("""
                ALTER TABLE applicant_profiles
                ADD COLUMN IF NOT EXISTS school VARCHAR(255)
                """);
        jdbcTemplate.execute("""
                ALTER TABLE applicant_profiles
                ADD COLUMN IF NOT EXISTS graduation_year VARCHAR(20)
                """);
        jdbcTemplate.execute("""
                ALTER TABLE applicant_profiles
                ADD COLUMN IF NOT EXISTS professional_summary VARCHAR(2000)
                """);
        jdbcTemplate.execute("""
                ALTER TABLE applicant_profiles
                ADD COLUMN IF NOT EXISTS degree_url VARCHAR(500)
                """);
        jdbcTemplate.execute("""
                ALTER TABLE applicant_profiles
                ADD COLUMN IF NOT EXISTS certificates_url VARCHAR(500)
                """);

        cleanupInvalidApplications();
    }

    private void cleanupInvalidApplications() {
        jdbcTemplate.execute("""
                DELETE FROM notifications
                WHERE application_id IN (
                    SELECT id FROM applications
                    WHERE user_id IS NULL OR job_id IS NULL
                )
                """);

        jdbcTemplate.execute("""
                DELETE FROM applications
                WHERE user_id IS NULL OR job_id IS NULL
                """);
    }
}
