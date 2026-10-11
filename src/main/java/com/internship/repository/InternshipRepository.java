package com.internship.repository;

import com.internship.model.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findAllByOrderByCreatedAtDesc();
    List<Internship> findByStatusOrderByCreatedAtDesc(String status);
}
