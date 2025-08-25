package com.example.demo.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Review;
import com.example.demo.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping("/assign")
    public ResponseEntity<Review> assignReviewer(@RequestParam UUID articleId,
            @RequestParam UUID reviewerId) {
        Review review = reviewService.assignReviewerToArticle(articleId, reviewerId);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/byReviewer")
    public ResponseEntity<List<Review>> getReviewsByReviewer(@RequestParam UUID reviewerId) {
        List<Review> reviews = reviewService.getReviewsByReviewer(reviewerId);
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateReview(
            @RequestParam UUID articleId,
            @RequestParam UUID reviewerId,
            @RequestParam String status,
            @RequestBody Review review) {

        reviewService.updateReview(articleId, reviewerId, review.getComments(), review.getRating(), status);
        return ResponseEntity.ok("Değerlendirme başarıyla güncellendi.");
    }

}
