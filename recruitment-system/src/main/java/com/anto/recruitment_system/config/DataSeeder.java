package com.anto.recruitment_system.config;

import com.anto.recruitment_system.entity.JobStatus;
import com.anto.recruitment_system.entity.JobVacancy;
import com.anto.recruitment_system.entity.Role;
import com.anto.recruitment_system.entity.User;
import com.anto.recruitment_system.repository.JobVacancyRepository;
import com.anto.recruitment_system.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository,
                               JobVacancyRepository jobVacancyRepository,
                               BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            seedUser(userRepository, passwordEncoder,
                    "HR Manager", "hr@gmail.com", "hr1234", Role.HR);
            seedUser(userRepository, passwordEncoder,
                    "System Administrator", "admin@gmail.com", "admin1234", Role.ADMIN);
            seedJobs(jobVacancyRepository);
        };
    }

    private void seedUser(UserRepository userRepository,
                          BCryptPasswordEncoder passwordEncoder,
                          String fullName,
                          String email,
                          String password,
                          Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            userRepository.save(user);
        }
    }

    private void seedJobs(JobVacancyRepository jobVacancyRepository) {
        if (jobVacancyRepository.count() > 0) {
            return;
        }

        jobVacancyRepository.save(createJob(
                "Software Engineer",
                "Information Technology",
                "Kigali, Rwanda",
                "Full-time",
                "Build and maintain recruitment platform features using Java and React.",
                "We are looking for a Software Engineer to design, develop, and maintain scalable web applications. "
                        + "You will collaborate with HR and product teams, write clean code, participate in code reviews, "
                        + "and help improve system performance and security.",
                LocalDate.now().plusMonths(2)
        ));

        jobVacancyRepository.save(createJob(
                "HR Officer",
                "Human Resources",
                "Kigali, Rwanda",
                "Full-time",
                "Support recruitment operations, applicant screening, and interview coordination.",
                "The HR Officer will manage applicant pipelines, review submitted profiles, coordinate interviews, "
                        + "and ensure a smooth candidate experience across all open vacancies.",
                LocalDate.now().plusMonths(1)
        ));

        jobVacancyRepository.save(createJob(
                "Data Analyst Intern",
                "Analytics",
                "Remote",
                "Internship",
                "Analyze recruitment metrics and prepare dashboards for HR leadership.",
                "This internship focuses on recruitment analytics, reporting, and dashboard design. "
                        + "You will work with HR and admin teams to turn application data into actionable insights.",
                LocalDate.now().plusWeeks(6)
        ));

        jobVacancyRepository.save(createJob(
                "UI/UX Designer",
                "Product Design",
                "Kigali, Rwanda",
                "Contract",
                "Design intuitive interfaces for applicants, HR, and administrators.",
                "You will create wireframes, prototypes, and polished UI designs for the recruitment platform, "
                        + "ensuring accessibility, responsiveness, and a professional user experience.",
                LocalDate.now().plusMonths(3)
        ));
    }

    private JobVacancy createJob(String title,
                                 String department,
                                 String location,
                                 String employmentType,
                                 String shortDescription,
                                 String fullDescription,
                                 LocalDate deadline) {
        JobVacancy job = new JobVacancy();
        job.setTitle(title);
        job.setDepartment(department);
        job.setLocation(location);
        job.setEmploymentType(employmentType);
        job.setShortDescription(shortDescription);
        job.setFullDescription(fullDescription);
        job.setDeadline(deadline);
        job.setStatus(JobStatus.OPEN);
        return job;
    }
}
