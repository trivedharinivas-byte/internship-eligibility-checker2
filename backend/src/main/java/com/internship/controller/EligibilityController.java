package com.internship.controller;

import com.internship.dto.EligibilityCheckRequest;
import com.internship.dto.EligibilityResultDto;
import com.internship.service.EligibilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eligibility")
@CrossOrigin(origins = "*")
public class EligibilityController {

    private final EligibilityService eligibilityService;

    public EligibilityController(EligibilityService eligibilityService) {
        this.eligibilityService = eligibilityService;
    }

    @PostMapping("/check")
    public ResponseEntity<?> checkEligibility(@RequestBody EligibilityCheckRequest request) {
        try {
            EligibilityResultDto result = eligibilityService.checkEligibility(request);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Eligibility check failed: " + e.getMessage()));
        }
    }

    @GetMapping("/check-all/{studentId}")
    public ResponseEntity<?> checkAllForStudent(@PathVariable Long studentId) {
        try {
            List<EligibilityResultDto> results = eligibilityService.checkAllForStudent(studentId);
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Batch check failed: " + e.getMessage()));
        }
    }
}
