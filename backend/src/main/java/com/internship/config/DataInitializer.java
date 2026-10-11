package com.internship.config;

import com.internship.model.*;
import com.internship.repository.ApplicationRepository;
import com.internship.repository.InternshipRepository;
import com.internship.repository.StudentProfileRepository;
import com.internship.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final InternshipRepository internshipRepository;
    private final ApplicationRepository applicationRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(UserRepository userRepository,
                           StudentProfileRepository studentProfileRepository,
                           InternshipRepository internshipRepository,
                           ApplicationRepository applicationRepository) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.internshipRepository = internshipRepository;
        this.applicationRepository = applicationRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already initialized
        }

        System.out.println(">>> Initializing default demo data for Internship Eligibility Checker...");

        // 1. Create Admin
        User admin = new User("admin@checker.com", passwordEncoder.encode("admin123"), "Placement Administrator", Role.ADMIN);
        userRepository.save(admin);

        // 2. Create Sample Students
        // Student 1: Priya Sharma (Computer Science, CGPA 8.6)
        User studentUser1 = new User("priya@student.com", passwordEncoder.encode("student123"), "Priya Sharma", Role.STUDENT);
        userRepository.save(studentUser1);

        StudentProfile priya = new StudentProfile(
                studentUser1,
                "Computer Science and Engineering",
                "3rd Year",
                8.60,
                "Java, Spring Boot, MySQL, Git, HTML, CSS",
                "Oracle Certified Associate Java SE 8, HackerRank Java (5 Stars)",
                "+91 98765 43210",
                "https://drive.google.com/file/d/priya-sharma-resume/view"
        );
        studentProfileRepository.save(priya);

        // Student 2: Rahul Verma (Mechanical, CGPA 7.2)
        User studentUser2 = new User("rahul@student.com", passwordEncoder.encode("student123"), "Rahul Verma", Role.STUDENT);
        userRepository.save(studentUser2);

        StudentProfile rahul = new StudentProfile(
                studentUser2,
                "Mechanical Engineering",
                "4th Year",
                7.20,
                "Python, C++, AutoCAD, SolidWorks, MATLAB",
                "Certified SolidWorks Associate (CSWA)",
                "+91 98765 43211",
                "https://drive.google.com/file/d/rahul-verma-resume/view"
        );
        studentProfileRepository.save(rahul);

        // Student 3: Ananya Patel (Information Technology, CGPA 7.9)
        User studentUser3 = new User("ananya@student.com", passwordEncoder.encode("student123"), "Ananya Patel", Role.STUDENT);
        userRepository.save(studentUser3);

        StudentProfile ananya = new StudentProfile(
                studentUser3,
                "Information Technology",
                "3rd Year",
                7.90,
                "JavaScript, React, Node.js, MongoDB, HTML, CSS",
                "AWS Certified Cloud Practitioner, Meta Front-End Developer",
                "+91 98765 43212",
                "https://drive.google.com/file/d/ananya-patel-resume/view"
        );
        studentProfileRepository.save(ananya);

        // 3. Create Sample Internships
        Internship amazon = new Internship(
                "Backend Java Developer Intern",
                "Amazon",
                "Bangalore / Hybrid",
                "6 Months",
                "₹45,000 / month",
                "Build highly scalable RESTful microservices, optimize database queries, and contribute to Amazon Web Services platform components.",
                7.50,
                "Computer Science, Information Technology, AI & Data Science",
                "Java, MySQL, Spring Boot",
                60.0,
                "2026-11-30",
                "ACTIVE"
        );
        internshipRepository.save(amazon);

        Internship microsoft = new Internship(
                "Full Stack Web Developer Intern",
                "Microsoft",
                "Hyderabad / Remote",
                "6 Months",
                "₹50,000 / month",
                "Develop responsive web interfaces with modern frontend frameworks and robust backend microservices for Microsoft 365 cloud products.",
                8.00,
                "Computer Science, Information Technology, Electronics",
                "JavaScript, React, Node.js, MongoDB",
                75.0,
                "2026-12-15",
                "ACTIVE"
        );
        internshipRepository.save(microsoft);

        Internship google = new Internship(
                "Data Science & AI Intern",
                "Google",
                "Bangalore",
                "3 Months",
                "₹60,000 / month",
                "Collaborate with Google AI research and engineering teams to process large datasets, build ML models, and optimize inference pipelines.",
                8.50,
                "Computer Science, AI & Data Science, Mathematics",
                "Python, Machine Learning, SQL, Pandas",
                70.0,
                "2026-11-20",
                "ACTIVE"
        );
        internshipRepository.save(google);

        Internship cisco = new Internship(
                "Cloud & DevOps Intern",
                "Cisco Systems",
                "Bangalore",
                "6 Months",
                "₹35,000 / month",
                "Design and maintain CI/CD pipelines, containerized deployments with Docker, and automated infrastructure using Linux and AWS.",
                7.00,
                "Computer Science, Information Technology, Electronics, Telecommunication",
                "Linux, Docker, AWS, Python, Git",
                50.0,
                "2026-12-05",
                "ACTIVE"
        );
        internshipRepository.save(cisco);

        Internship flipkart = new Internship(
                "Frontend UI/UX Intern",
                "Flipkart",
                "Bangalore / Remote",
                "4 Months",
                "₹30,000 / month",
                "Craft user-centric e-commerce interfaces, improve web performance, and implement accessible UI components in React.",
                6.50,
                "All Branches, Computer Science, Information Technology, Mechanical, Electronics",
                "HTML, CSS, JavaScript, React, Figma",
                50.0,
                "2026-12-10",
                "ACTIVE"
        );
        internshipRepository.save(flipkart);

        Internship bosch = new Internship(
                "Embedded Systems & IoT Intern",
                "Bosch",
                "Pune",
                "6 Months",
                "₹28,000 / month",
                "Develop firmware for automotive electronic control units, sensor interfacing, and microcontrollers using C and C++.",
                7.20,
                "Electronics, Electrical, Mechanical, Robotics",
                "C, C++, Embedded Systems, Microcontrollers",
                60.0,
                "2026-11-25",
                "ACTIVE"
        );
        internshipRepository.save(bosch);

        // 4. Create Initial Applications
        // Priya applied for Amazon (Eligible: Java, MySQL, Spring Boot 100%, CGPA 8.6 >= 7.5) -> Shortlisted
        Application app1 = new Application(priya, amazon, 100.0, "Java, MySQL, Spring Boot", "");
        app1.setStatus("Shortlisted");
        app1.setAdminNotes("Strong academic record and full skill match. Scheduled for technical interview.");
        app1.setAppliedAt(LocalDateTime.now().minusDays(3));
        applicationRepository.save(app1);

        // Ananya applied for Microsoft (Eligible: JavaScript, React, Node.js, MongoDB 100%, CGPA 7.9 -> close test) -> Applied
        // Wait, for Microsoft Min CGPA is 8.0, Ananya has 7.9. Let's see: Priya applied for Cisco
        Application app2 = new Application(priya, cisco, 60.0, "Git, Linux", "Docker, AWS, Python");
        app2.setStatus("Applied");
        app2.setAppliedAt(LocalDateTime.now().minusDays(1));
        applicationRepository.save(app2);

        // Rahul applied for Bosch (Eligible: C++, Mechanical, CGPA 7.2 >= 7.2)
        Application app3 = new Application(rahul, bosch, 60.0, "C++, Embedded Systems", "C, Microcontrollers");
        app3.setStatus("Selected");
        app3.setAdminNotes("Candidate selected for Bosch IoT & Automotive R&D team!");
        app3.setAppliedAt(LocalDateTime.now().minusDays(5));
        applicationRepository.save(app3);

        System.out.println(">>> Initialized 1 Admin, 3 Students, 6 Internships, and 3 Sample Applications.");
    }
}
