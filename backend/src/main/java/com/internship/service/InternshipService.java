package com.internship.service;

import com.internship.dto.InternshipRequest;
import com.internship.model.Internship;
import com.internship.repository.InternshipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InternshipService {

    private final InternshipRepository internshipRepository;

    public InternshipService(InternshipRepository internshipRepository) {
        this.internshipRepository = internshipRepository;
    }

    public List<Internship> getAllInternships() {
        return internshipRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Internship> getActiveInternships() {
        return internshipRepository.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }

    public Optional<Internship> getInternshipById(Long id) {
        return internshipRepository.findById(id);
    }

    @Transactional
    public Internship createInternship(InternshipRequest request) {
        Internship internship = new Internship(
                request.getTitle(),
                request.getCompany(),
                request.getLocation(),
                request.getDuration(),
                request.getStipend(),
                request.getDescription(),
                request.getMinimumCgpa(),
                request.getEligibleBranches(),
                request.getRequiredSkills(),
                request.getMinimumSkillMatch() != null ? request.getMinimumSkillMatch() : 50.0,
                request.getDeadline(),
                request.getStatus() != null ? request.getStatus() : "ACTIVE"
        );
        return internshipRepository.save(internship);
    }

    @Transactional
    public Internship updateInternship(Long id, InternshipRequest request) {
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Internship with ID " + id + " not found"));

        if (request.getTitle() != null) internship.setTitle(request.getTitle());
        if (request.getCompany() != null) internship.setCompany(request.getCompany());
        if (request.getLocation() != null) internship.setLocation(request.getLocation());
        if (request.getDuration() != null) internship.setDuration(request.getDuration());
        if (request.getStipend() != null) internship.setStipend(request.getStipend());
        if (request.getDescription() != null) internship.setDescription(request.getDescription());
        if (request.getMinimumCgpa() != null) internship.setMinimumCgpa(request.getMinimumCgpa());
        if (request.getEligibleBranches() != null) internship.setEligibleBranches(request.getEligibleBranches());
        if (request.getRequiredSkills() != null) internship.setRequiredSkills(request.getRequiredSkills());
        if (request.getMinimumSkillMatch() != null) internship.setMinimumSkillMatch(request.getMinimumSkillMatch());
        if (request.getDeadline() != null) internship.setDeadline(request.getDeadline());
        if (request.getStatus() != null) internship.setStatus(request.getStatus());

        return internshipRepository.save(internship);
    }

    @Transactional
    public void deleteInternship(Long id) {
        if (!internshipRepository.existsById(id)) {
            throw new IllegalArgumentException("Internship with ID " + id + " not found");
        }
        internshipRepository.deleteById(id);
    }
}
