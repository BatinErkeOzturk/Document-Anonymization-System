package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Reviewer;
import com.example.demo.service.ReviewerService;

@RestController
@RequestMapping("/api/reviewers")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewerController {
    private final ReviewerService reviewerService;

    public ReviewerController(ReviewerService reviewerService) {
        this.reviewerService = reviewerService;
    }

     @GetMapping
    public ResponseEntity<?> getReviewerByEmail(@RequestParam String email) {
        Reviewer reviewer = reviewerService.findByEmail(email);
        if (reviewer != null) {
            return ResponseEntity.ok(Map.of("id", reviewer.getId()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reviewer bulunamadı");
        }
    }

    @GetMapping("/by-field")
    public List<Reviewer> getReviewersByField(@RequestParam String interestField) {
        return reviewerService.getReviewersByInterestField(interestField);
    }
}
