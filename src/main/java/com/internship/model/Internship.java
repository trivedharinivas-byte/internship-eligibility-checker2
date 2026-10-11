package com.internship.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "internships")
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String duration;

    @Column(nullable = false)
    private String stipend;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double minimumCgpa;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String eligibleBranches;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(nullable = false)
    private Double minimumSkillMatch; // e.g. 60.0 means 60%

    @Column
    private String deadline;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, CLOSED

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Internship() {
    }

    public Internship(String title, String company, String location, String duration, String stipend,
                      String description, Double minimumCgpa, String eligibleBranches,
                      String requiredSkills, Double minimumSkillMatch, String deadline, String status) {
        this.title = title;
        this.company = company;
        this.location = location;
        this.duration = duration;
        this.stipend = stipend;
        this.description = description;
        this.minimumCgpa = minimumCgpa;
        this.eligibleBranches = eligibleBranches;
        this.requiredSkills = requiredSkills;
        this.minimumSkillMatch = minimumSkillMatch;
        this.deadline = deadline;
        this.status = status != null ? status : "ACTIVE";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getStipend() {
        return stipend;
    }

    public void setStipend(String stipend) {
        this.stipend = stipend;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getMinimumCgpa() {
        return minimumCgpa;
    }

    public void setMinimumCgpa(Double minimumCgpa) {
        this.minimumCgpa = minimumCgpa;
    }

    public String getEligibleBranches() {
        return eligibleBranches;
    }

    public void setEligibleBranches(String eligibleBranches) {
        this.eligibleBranches = eligibleBranches;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public Double getMinimumSkillMatch() {
        return minimumSkillMatch;
    }

    public void setMinimumSkillMatch(Double minimumSkillMatch) {
        this.minimumSkillMatch = minimumSkillMatch;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
