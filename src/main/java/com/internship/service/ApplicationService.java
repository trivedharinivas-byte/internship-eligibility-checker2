package com.internship.service;

import com.internship.dto.ApplicationStatusUpdateRequest;
import com.internship.dto.DashboardStatsDto;
import com.internship.dto.EligibilityResultDto;
import com.internship.model.Application;
import com.internship.model.Internship;
import com.internship.model.StudentProfile;
import com.internship.repository.ApplicationRepository;
import com.internship.repository.InternshipRepository;
import com.internship.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final InternshipRepository internshipRepository;
    private final EligibilityService eligibilityService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentProfileRepository studentProfileRepository,
                              InternshipRepository internshipRepository,
                              EligibilityService eligibilityService) {
        this.applicationRepository = applicationRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.internshipRepository = internshipRepository;
        this.eligibilityService = eligibilityService;
    }

    @Transactional
    public Application apply(Long studentId, Long internshipId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .or(() -> studentProfileRepository.findByUserId(studentId))
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found. Please complete your profile first."));

        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new IllegalArgumentException("Internship with ID " + internshipId + " not found"));

        if (!"ACTIVE".equalsIgnoreCase(internship.getStatus())) {
            throw new IllegalStateException("Applications for this internship are currently closed.");
        }

        // 1. Check duplicate application
        if (applicationRepository.existsByStudentIdAndInternshipId(student.getId(), internship.getId())) {
            throw new IllegalStateException("Duplicate application rejected: You have already applied for this internship.");
        }

        // 2. Perform Eligibility Verification
        EligibilityResultDto eligibility = eligibilityService.evaluateEligibility(
                internship, student.getBranch(), student.getCgpa(), student.getSkills(), student.getId()
        );

        if (!eligibility.isEligible()) {
            String reasonText = String.join(" | ", eligibility.getReasons());
            throw new IllegalStateException("Ineligible application rejected: " + reasonText);
        }

        // 3. Create Application
        Application application = new Application();
        application.setStudent(student);
        application.setInternship(internship);
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus("Applied");
        application.setSkillMatchPercentage(eligibility.getSkillMatchPercentage());
        application.setMatchedSkills(String.join(", ", eligibility.getMatchedSkills()));
        application.setMissingSkills(String.join(", ", eligibility.getMissingSkills()));

        return applicationRepository.save(application);
    }

    public List<Application> getStudentApplications(Long studentId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .or(() -> studentProfileRepository.findByUserId(studentId))
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found"));

        return applicationRepository.findByStudentIdOrderByAppliedAtDesc(student.getId());
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAllByOrderByAppliedAtDesc();
    }

    public List<Application> getApplicationsByStatus(String status) {
        return applicationRepository.findByStatusOrderByAppliedAtDesc(status);
    }

    public List<Application> getApplicationsByInternship(Long internshipId) {
        return applicationRepository.findByInternshipIdOrderByAppliedAtDesc(internshipId);
    }

    @Transactional
    public Application updateStatus(Long applicationId, ApplicationStatusUpdateRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application with ID " + applicationId + " not found"));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            application.setStatus(request.getStatus().trim());
        }
        if (request.getAdminNotes() != null) {
            application.setAdminNotes(request.getAdminNotes());
        }

        return applicationRepository.save(application);
    }

    public DashboardStatsDto getDashboardStats() {
        long totalInternships = internshipRepository.count();
        long totalStudents = studentProfileRepository.count();
        long totalApplications = applicationRepository.count();
        long shortlistedCount = applicationRepository.countByStatus("Shortlisted");
        long selectedCount = applicationRepository.countByStatus("Selected");
        long rejectedCount = applicationRepository.countByStatus("Rejected");

        return new DashboardStatsDto(
                totalInternships,
                totalStudents,
                totalApplications,
                shortlistedCount,
                selectedCount,
                rejectedCount
        );
    }
}
