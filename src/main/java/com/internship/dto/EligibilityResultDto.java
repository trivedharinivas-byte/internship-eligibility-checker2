package com.internship.dto;

import java.util.ArrayList;
import java.util.List;

public class EligibilityResultDto {

    private Long internshipId;
    private String internshipTitle;
    private String company;
    private String location;
    private String stipend;

    // Branch Details
    private String studentBranch;
    private String eligibleBranches;
    private boolean branchEligible;

    // CGPA Details
    private Double studentCgpa;
    private Double minimumCgpa;
    private boolean cgpaEligible;

    // Skill Details
    private List<String> studentSkills = new ArrayList<>();
    private List<String> requiredSkills = new ArrayList<>();
    private List<String> matchedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private Double skillMatchPercentage;
    private Double minimumSkillMatch;
    private boolean skillEligible;

    // Overall
    private boolean eligible;
    private List<String> reasons = new ArrayList<>();
    private List<String> suggestions = new ArrayList<>();

    // Application state
    private boolean alreadyApplied;
    private String applicationStatus;

    public EligibilityResultDto() {
    }

    public Long getInternshipId() {
        return internshipId;
    }

    public void setInternshipId(Long internshipId) {
        this.internshipId = internshipId;
    }

    public String getInternshipTitle() {
        return internshipTitle;
    }

    public void setInternshipTitle(String internshipTitle) {
        this.internshipTitle = internshipTitle;
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

    public String getStipend() {
        return stipend;
    }

    public void setStipend(String stipend) {
        this.stipend = stipend;
    }

    public String getStudentBranch() {
        return studentBranch;
    }

    public void setStudentBranch(String studentBranch) {
        this.studentBranch = studentBranch;
    }

    public String getEligibleBranches() {
        return eligibleBranches;
    }

    public void setEligibleBranches(String eligibleBranches) {
        this.eligibleBranches = eligibleBranches;
    }

    public boolean isBranchEligible() {
        return branchEligible;
    }

    public void setBranchEligible(boolean branchEligible) {
        this.branchEligible = branchEligible;
    }

    public Double getStudentCgpa() {
        return studentCgpa;
    }

    public void setStudentCgpa(Double studentCgpa) {
        this.studentCgpa = studentCgpa;
    }

    public Double getMinimumCgpa() {
        return minimumCgpa;
    }

    public void setMinimumCgpa(Double minimumCgpa) {
        this.minimumCgpa = minimumCgpa;
    }

    public boolean isCgpaEligible() {
        return cgpaEligible;
    }

    public void setCgpaEligible(boolean cgpaEligible) {
        this.cgpaEligible = cgpaEligible;
    }

    public List<String> getStudentSkills() {
        return studentSkills;
    }

    public void setStudentSkills(List<String> studentSkills) {
        this.studentSkills = studentSkills;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public Double getSkillMatchPercentage() {
        return skillMatchPercentage;
    }

    public void setSkillMatchPercentage(Double skillMatchPercentage) {
        this.skillMatchPercentage = skillMatchPercentage;
    }

    public Double getMinimumSkillMatch() {
        return minimumSkillMatch;
    }

    public void setMinimumSkillMatch(Double minimumSkillMatch) {
        this.minimumSkillMatch = minimumSkillMatch;
    }

    public boolean isSkillEligible() {
        return skillEligible;
    }

    public void setSkillEligible(boolean skillEligible) {
        this.skillEligible = skillEligible;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public boolean isAlreadyApplied() {
        return alreadyApplied;
    }

    public void setAlreadyApplied(boolean alreadyApplied) {
        this.alreadyApplied = alreadyApplied;
    }

    public String getApplicationStatus() {
        return applicationStatus;
    }

    public void setApplicationStatus(String applicationStatus) {
        this.applicationStatus = applicationStatus;
    }
}
