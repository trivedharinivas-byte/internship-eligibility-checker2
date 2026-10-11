package com.internship.controller;

import com.internship.dto.InternshipRequest;
import com.internship.model.Internship;
import com.internship.service.InternshipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/internships")
@CrossOrigin(origins = "*")
public class InternshipController {

    private final InternshipService internshipService;

    public InternshipController(InternshipService internshipService) {
        this.internshipService = internshipService;
    }

    @GetMapping
    public ResponseEntity<List<Internship>> getAllInternships(@RequestParam(required = false) String status) {
        if ("ACTIVE".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(internshipService.getActiveInternships());
        }
        return ResponseEntity.ok(internshipService.getAllInternships());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInternshipById(@PathVariable Long id) {
        return internshipService.getInternshipById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createInternship(@RequestBody InternshipRequest request) {
        try {
            Internship created = internshipService.createInternship(request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInternship(@PathVariable Long id, @RequestBody InternshipRequest request) {
        try {
            Internship updated = internshipService.updateInternship(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInternship(@PathVariable Long id) {
        try {
            internshipService.deleteInternship(id);
            return ResponseEntity.ok(Map.of("message", "Internship deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
