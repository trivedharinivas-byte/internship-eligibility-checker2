-- ========================================================
-- Internship Eligibility Checker - Database Schema & Data
-- DBMS: MySQL
-- ========================================================

CREATE DATABASE IF NOT EXISTS `internship_db`;
USE `internship_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS `student_profiles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `branch` VARCHAR(255) NOT NULL,
    `study_year` VARCHAR(100) NOT NULL,
    `cgpa` DOUBLE NOT NULL,
    `skills` TEXT,
    `certifications` TEXT,
    `phone` VARCHAR(50),
    `resume_link` VARCHAR(500),
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- 3. Internships Table
CREATE TABLE IF NOT EXISTS `internships` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `duration` VARCHAR(100) NOT NULL,
    `stipend` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `minimum_cgpa` DOUBLE NOT NULL,
    `eligible_branches` TEXT NOT NULL,
    `required_skills` TEXT NOT NULL,
    `minimum_skill_match` DOUBLE NOT NULL,
    `deadline` VARCHAR(50),
    `status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Applications Table
CREATE TABLE IF NOT EXISTS `applications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_id` BIGINT NOT NULL,
    `internship_id` BIGINT NOT NULL,
    `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Applied',
    `skill_match_percentage` DOUBLE,
    `matched_skills` TEXT,
    `missing_skills` TEXT,
    `admin_notes` TEXT,
    CONSTRAINT `fk_app_student` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_app_internship` FOREIGN KEY (`internship_id`) REFERENCES `internships` (`id`) ON DELETE CASCADE,
    CONSTRAINT `unique_student_internship` UNIQUE (`student_id`, `internship_id`)
);

-- Sample Data Inserts
-- Password for all seed users is hashed with BCrypt (password for admin is 'admin123', for students is 'student123')
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`) VALUES
(1, 'admin@checker.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Placement Administrator', 'ADMIN', NOW()),
(2, 'priya@student.com', '$2a$10$o3Dvy1cE1R8nQ7yR/FkWm.rG9s8jF3g8Q9H0Hl5U8K0I7T7I1J1.K', 'Priya Sharma', 'STUDENT', NOW()),
(3, 'rahul@student.com', '$2a$10$o3Dvy1cE1R8nQ7yR/FkWm.rG9s8jF3g8Q9H0Hl5U8K0I7T7I1J1.K', 'Rahul Verma', 'STUDENT', NOW());

INSERT INTO `student_profiles` (`id`, `user_id`, `branch`, `study_year`, `cgpa`, `skills`, `certifications`, `phone`, `resume_link`, `updated_at`) VALUES
(1, 2, 'Computer Science and Engineering', '3rd Year', 8.60, 'Java, Spring Boot, MySQL, Git, HTML, CSS', 'Oracle Java SE 8 Certified', '+91 98765 43210', 'https://drive.google.com/priya_resume.pdf', NOW()),
(2, 3, 'Mechanical Engineering', '4th Year', 7.20, 'Python, C++, AutoCAD, SolidWorks', 'Certified SolidWorks Associate', '+91 98765 43211', 'https://drive.google.com/rahul_resume.pdf', NOW());

INSERT INTO `internships` (`id`, `title`, `company`, `location`, `duration`, `stipend`, `description`, `minimum_cgpa`, `eligible_branches`, `required_skills`, `minimum_skill_match`, `deadline`, `status`, `created_at`) VALUES
(1, 'Backend Java Developer Intern', 'Amazon', 'Bangalore / Hybrid', '6 Months', '₹45,000 / month', 'Build distributed microservices with Java and Spring Boot.', 7.50, 'Computer Science, Information Technology, AI & Data Science', 'Java, MySQL, Spring Boot', 60.0, '2026-11-30', 'ACTIVE', NOW()),
(2, 'Full Stack Web Developer Intern', 'Microsoft', 'Hyderabad / Remote', '6 Months', '₹50,000 / month', 'Develop high performance web interfaces with modern cloud backend.', 8.00, 'Computer Science, Information Technology, Electronics', 'JavaScript, React, Node.js, MongoDB', 75.0, '2026-12-15', 'ACTIVE', NOW()),
(3, 'Embedded Systems & IoT Intern', 'Bosch', 'Pune', '6 Months', '₹28,000 / month', 'Firmware development for automotive microcontrollers.', 7.20, 'Electronics, Electrical, Mechanical, Robotics', 'C, C++, Embedded Systems, Microcontrollers', 60.0, '2026-11-25', 'ACTIVE', NOW());

INSERT INTO `applications` (`id`, `student_id`, `internship_id`, `applied_at`, `status`, `skill_match_percentage`, `matched_skills`, `missing_skills`, `admin_notes`) VALUES
(1, 1, 1, NOW(), 'Shortlisted', 100.0, 'Java, MySQL, Spring Boot', '', 'Strong candidate with full skill match. Technical round scheduled.'),
(2, 2, 3, NOW(), 'Selected', 60.0, 'C++, Embedded Systems', 'C, Microcontrollers', 'Accepted for Automotive IoT R&D division.');
