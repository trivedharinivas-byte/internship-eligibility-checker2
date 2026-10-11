package com.internship.dto;

public class EligibilityCheckRequest {
    private Long internshipId;
    private Long studentId; // optional if checking logged-in student or custom test

    // Optional override parameters for interactive "What-If" testing
    private String customBranch;
    private Double customCgpa;
    private String customSkills;

    public EligibilityCheckRequest() {
    }

    public EligibilityCheckRequest(Long internshipId, Long studentId) {
        this.internshipId = internshipId;
        this.studentId = studentId;
    }

    public Long getInternshipId() {
        return internshipId;
    }

    public void setInternshipId(Long internshipId) {
        this.internshipId = internshipId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getCustomBranch() {
        return customBranch;
    }

    public void setCustomBranch(String customBranch) {
        this.customBranch = customBranch;
    }

    public Double getCustomCgpa() {
        return customCgpa;
    }

    public void setCustomCgpa(Double customCgpa) {
        this.customCgpa = customCgpa;
    }

    public String getCustomSkills() {
        return customSkills;
    }

    public void setCustomSkills(String customSkills) {
        this.customSkills = customSkills;
    }
}
