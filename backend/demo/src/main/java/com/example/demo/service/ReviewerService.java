package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Reviewer;
import com.example.demo.repository.ReviewerRepository;

@Service
public class ReviewerService {
    private final ReviewerRepository reviewerRepository;

    public ReviewerService(ReviewerRepository reviewerRepository) {
        this.reviewerRepository = reviewerRepository;
    }

    public List<Reviewer> getReviewersByInterestField(String interestField) {
        return reviewerRepository.findByInterestField(interestField);
    }

    public Reviewer findByEmail(String email) {
        return reviewerRepository.findByEmail(email).orElse(null);
    }
    
}
