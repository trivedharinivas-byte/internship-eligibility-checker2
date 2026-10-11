package com.internship.controller;

import com.internship.dto.ApplicationStatusUpdateRequest;
import com.internship.dto.DashboardStatsDto;
import com.internship.model.Application;
import com.internship.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody Map<String, Long> payload) {
        Long studentId = payload.get("studentId");
        Long internshipId = payload.get("internshipId");

        if (studentId == null || internshipId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Both studentId and internshipId are required"));
        }

        try {
            Application application = applicationService.apply(studentId, internshipId);
            return ResponseEntity.ok(application);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Application failed: " + e.getMessage()));
        }
    }

    @GetMapping("/my/{studentId}")
    public ResponseEntity<?> getMyApplications(@PathVariable Long studentId) {
        try {
            List<Application> apps = applicationService.getStudentApplications(studentId);
            return ResponseEntity.ok(apps);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Application>> getAllApplications(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(applicationService.getApplicationsByStatus(status));
        }
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody ApplicationStatusUpdateRequest request) {
        try {
            Application updated = applicationService.updateStatus(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Status update failed: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(applicationService.getDashboardStats());
    }
}
