package com.internship.repository;

import com.internship.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentIdOrderByAppliedAtDesc(Long studentId);
    List<Application> findByStudentUserEmailOrderByAppliedAtDesc(String email);
    List<Application> findAllByOrderByAppliedAtDesc();
    List<Application> findByInternshipIdOrderByAppliedAtDesc(Long internshipId);
    List<Application> findByStatusOrderByAppliedAtDesc(String status);
    boolean existsByStudentIdAndInternshipId(Long studentId, Long internshipId);
    Optional<Application> findByStudentIdAndInternshipId(Long studentId, Long internshipId);
    long countByStatus(String status);
}
