package com.internship.service;

import com.internship.dto.EligibilityCheckRequest;
import com.internship.dto.EligibilityResultDto;
import com.internship.model.Application;
import com.internship.model.Internship;
import com.internship.model.StudentProfile;
import com.internship.repository.ApplicationRepository;
import com.internship.repository.InternshipRepository;
import com.internship.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EligibilityService {

    private final InternshipRepository internshipRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ApplicationRepository applicationRepository;

    public EligibilityService(InternshipRepository internshipRepository,
                              StudentProfileRepository studentProfileRepository,
                              ApplicationRepository applicationRepository) {
        this.internshipRepository = internshipRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.applicationRepository = applicationRepository;
    }

    public EligibilityResultDto checkEligibility(EligibilityCheckRequest request) {
        Internship internship = internshipRepository.findById(request.getInternshipId())
                .orElseThrow(() -> new IllegalArgumentException("Internship with ID " + request.getInternshipId() + " not found"));

        String branch;
        Double cgpa;
        String rawSkills;
        Long studentProfileId = null;

        if (request.getStudentId() != null) {
            Optional<StudentProfile> profileOpt = studentProfileRepository.findById(request.getStudentId());
            if (profileOpt.isEmpty()) {
                profileOpt = studentProfileRepository.findByUserId(request.getStudentId());
            }

            if (profileOpt.isPresent()) {
                StudentProfile profile = profileOpt.get();
                studentProfileId = profile.getId();
                branch = request.getCustomBranch() != null ? request.getCustomBranch() : profile.getBranch();
                cgpa = request.getCustomCgpa() != null ? request.getCustomCgpa() : profile.getCgpa();
                rawSkills = request.getCustomSkills() != null ? request.getCustomSkills() : profile.getSkills();
            } else {
                branch = request.getCustomBranch() != null ? request.getCustomBranch() : "Unknown";
                cgpa = request.getCustomCgpa() != null ? request.getCustomCgpa() : 0.0;
                rawSkills = request.getCustomSkills() != null ? request.getCustomSkills() : "";
            }
        } else {
            branch = request.getCustomBranch() != null ? request.getCustomBranch() : "Computer Science";
            cgpa = request.getCustomCgpa() != null ? request.getCustomCgpa() : 7.0;
            rawSkills = request.getCustomSkills() != null ? request.getCustomSkills() : "";
        }

        return evaluateEligibility(internship, branch, cgpa, rawSkills, studentProfileId);
    }

    public EligibilityResultDto evaluateEligibility(Internship internship, String studentBranch, Double studentCgpa,
                                                    String studentRawSkills, Long studentProfileId) {
        EligibilityResultDto result = new EligibilityResultDto();
        result.setInternshipId(internship.getId());
        result.setInternshipTitle(internship.getTitle());
        result.setCompany(internship.getCompany());
        result.setLocation(internship.getLocation());
        result.setStipend(internship.getStipend());

        // 1. Branch Evaluation
        result.setStudentBranch(studentBranch);
        result.setEligibleBranches(internship.getEligibleBranches());
        boolean branchEligible = checkBranchEligibility(studentBranch, internship.getEligibleBranches());
        result.setBranchEligible(branchEligible);

        // 2. CGPA Evaluation
        result.setStudentCgpa(studentCgpa);
        result.setMinimumCgpa(internship.getMinimumCgpa());
        boolean cgpaEligible = studentCgpa != null && studentCgpa >= internship.getMinimumCgpa();
        result.setCgpaEligible(cgpaEligible);

        // 3. Skill Evaluation & Matching Percentage
        List<String> studentSkillList = parseSkills(studentRawSkills);
        List<String> requiredSkillList = parseSkills(internship.getRequiredSkills());
        result.setStudentSkills(studentSkillList);
        result.setRequiredSkills(requiredSkillList);

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String req : requiredSkillList) {
            boolean matched = false;
            for (String s : studentSkillList) {
                if (isSkillMatch(s, req)) {
                    matched = true;
                    break;
                }
            }
            if (matched) {
                matchedSkills.add(req);
            } else {
                missingSkills.add(req);
            }
        }

        result.setMatchedSkills(matchedSkills);
        result.setMissingSkills(missingSkills);

        double skillMatchPercent = 100.0;
        if (!requiredSkillList.isEmpty()) {
            double calculated = ((double) matchedSkills.size() / (double) requiredSkillList.size()) * 100.0;
            BigDecimal bd = BigDecimal.valueOf(calculated).setScale(2, RoundingMode.HALF_UP);
            skillMatchPercent = bd.doubleValue();
        }

        result.setSkillMatchPercentage(skillMatchPercent);
        result.setMinimumSkillMatch(internship.getMinimumSkillMatch());

        boolean skillEligible = skillMatchPercent >= (internship.getMinimumSkillMatch() != null ? internship.getMinimumSkillMatch() : 50.0);
        result.setSkillEligible(skillEligible);

        // 4. Overall Decision
        boolean overallEligible = branchEligible && cgpaEligible && skillEligible;
        result.setEligible(overallEligible);

        // 5. Reasons and Suggestions
        List<String> reasons = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (overallEligible) {
            reasons.add("You fulfill all eligibility requirements for this internship position!");
            reasons.add(String.format("Your CGPA of %.2f meets the minimum requirement of %.2f.", studentCgpa, internship.getMinimumCgpa()));
            reasons.add(String.format("Your branch '%s' is in the eligible disciplines.", studentBranch));
            reasons.add(String.format("Skill match is %.2f%% (meets or exceeds the required %.1f%%).", skillMatchPercent, internship.getMinimumSkillMatch()));
            suggestions.add("Ensure your resume link and project portfolio are up to date before applying.");
            suggestions.add("Review core questions related to " + String.join(", ", matchedSkills) + " in preparation for technical screening.");
        } else {
            // Detailed failure reasons and actionable suggestions
            if (!cgpaEligible) {
                reasons.add(String.format("CGPA Requirement Not Met: Your CGPA is %.2f, but the internship requires a minimum of %.2f (difference: %.2f).",
                        studentCgpa, internship.getMinimumCgpa(), (internship.getMinimumCgpa() - studentCgpa)));
                suggestions.add(String.format("Focus on upcoming semester examinations and core theory subjects to boost your cumulative CGPA towards %.2f.",
                        internship.getMinimumCgpa()));
            }

            if (!branchEligible) {
                reasons.add(String.format("Branch Mismatch: Your branch '%s' is not listed among the eligible branches (%s).",
                        studentBranch, internship.getEligibleBranches()));
                suggestions.add("Consider exploring interdisciplinary internship postings or consult your college placement cell for cross-branch approvals.");
            }

            if (!skillEligible) {
                reasons.add(String.format("Skill Match Below Threshold: Your skill match is %.2f%%, which is below the minimum required %.1f%%.",
                        skillMatchPercent, internship.getMinimumSkillMatch()));
                if (!missingSkills.isEmpty()) {
                    reasons.add("Missing required skills: " + String.join(", ", missingSkills));
                    suggestions.add("Recommended action: Learn and build hands-on projects focusing on " + String.join(", ", missingSkills) + " to fulfill this requirement.");
                    suggestions.add("Consider taking certified online courses or coding tutorials in " + String.join(" and ", missingSkills) + ".");
                }
            }
        }

        result.setReasons(reasons);
        result.setSuggestions(suggestions);

        // Check if student has already applied
        if (studentProfileId != null) {
            Optional<Application> existingApp = applicationRepository.findByStudentIdAndInternshipId(studentProfileId, internship.getId());
            if (existingApp.isPresent()) {
                result.setAlreadyApplied(true);
                result.setApplicationStatus(existingApp.get().getStatus());
            } else {
                result.setAlreadyApplied(false);
            }
        }

        return result;
    }

    public List<EligibilityResultDto> checkAllForStudent(Long studentId) {
        StudentProfile profile = studentProfileRepository.findById(studentId)
                .or(() -> studentProfileRepository.findByUserId(studentId))
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found"));

        List<Internship> activeInternships = internshipRepository.findByStatusOrderByCreatedAtDesc("ACTIVE");
        List<EligibilityResultDto> results = new ArrayList<>();

        for (Internship internship : activeInternships) {
            results.add(evaluateEligibility(internship, profile.getBranch(), profile.getCgpa(), profile.getSkills(), profile.getId()));
        }

        return results;
    }

    private boolean checkBranchEligibility(String studentBranch, String eligibleBranches) {
        if (eligibleBranches == null || eligibleBranches.isBlank()) return true;
        if (studentBranch == null || studentBranch.isBlank()) return false;

        String sBranch = studentBranch.trim().toLowerCase();
        String eBranches = eligibleBranches.trim().toLowerCase();

        if (eBranches.contains("all") || eBranches.contains("any") || eBranches.contains("open")) {
            return true;
        }

        String[] branchTokens = eligibleBranches.split("[,;/]");
        for (String b : branchTokens) {
            String token = b.trim().toLowerCase();
            if (token.isEmpty()) continue;
            if (sBranch.equalsIgnoreCase(token) || sBranch.contains(token) || token.contains(sBranch)) {
                return true;
            }
            // Acronym checks (e.g. CSE, IT, ECE, ME, CE)
            if (token.contains("cse") && (sBranch.contains("computer") || sBranch.contains("cse"))) return true;
            if (token.contains("it") && (sBranch.contains("information technology") || sBranch.equals("it"))) return true;
            if (token.contains("ece") && (sBranch.contains("electronic") || sBranch.contains("ece"))) return true;
            if (token.contains("ee") && (sBranch.contains("electrical") || sBranch.contains("eee"))) return true;
            if (token.contains("mech") && sBranch.contains("mech")) return true;
            if (token.contains("civil") && sBranch.contains("civil")) return true;
            if (token.contains("data") && sBranch.contains("data")) return true;
            if (token.contains("ai") && (sBranch.contains("ai") || sBranch.contains("artificial"))) return true;
        }

        return false;
    }

    private List<String> parseSkills(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        return Arrays.stream(raw.split("[,;/]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private boolean isSkillMatch(String studentSkill, String requiredSkill) {
        if (studentSkill == null || requiredSkill == null) return false;
        String s1 = normalizeSkill(studentSkill);
        String s2 = normalizeSkill(requiredSkill);

        if (s1.equals(s2)) return true;
        if (s1.contains(s2) || s2.contains(s1)) return true;

        // Common Tech Synonyms
        if (matchesSynonyms(s1, s2, "react", "reactjs", "react.js")) return true;
        if (matchesSynonyms(s1, s2, "node", "nodejs", "node.js")) return true;
        if (matchesSynonyms(s1, s2, "spring boot", "springboot", "spring-boot", "spring")) return true;
        if (matchesSynonyms(s1, s2, "mysql", "sql", "postgresql", "rdbms")) return true;
        if (matchesSynonyms(s1, s2, "c++", "cpp", "cplusplus")) return true;
        if (matchesSynonyms(s1, s2, "c#", "csharp")) return true;
        if (matchesSynonyms(s1, s2, "javascript", "js", "ecmascript")) return true;
        if (matchesSynonyms(s1, s2, "typescript", "ts")) return true;
        if (matchesSynonyms(s1, s2, "python", "python3", "py")) return true;
        if (matchesSynonyms(s1, s2, "machine learning", "ml", "deep learning", "ai")) return true;
        if (matchesSynonyms(s1, s2, "html", "html5")) return true;
        if (matchesSynonyms(s1, s2, "css", "css3")) return true;
        if (matchesSynonyms(s1, s2, "docker", "containers", "kubernetes", "k8s")) return true;
        if (matchesSynonyms(s1, s2, "aws", "amazon web services", "cloud")) return true;

        return false;
    }

    private String normalizeSkill(String skill) {
        return skill.trim().toLowerCase().replaceAll("[^a-z0-9#+.]", "");
    }

    private boolean matchesSynonyms(String s1, String s2, String... group) {
        boolean s1InGroup = false;
        boolean s2InGroup = false;
        for (String g : group) {
            String norm = normalizeSkill(g);
            if (s1.equals(norm) || s1.contains(norm)) s1InGroup = true;
            if (s2.equals(norm) || s2.contains(norm)) s2InGroup = true;
        }
        return s1InGroup && s2InGroup;
    }
}
