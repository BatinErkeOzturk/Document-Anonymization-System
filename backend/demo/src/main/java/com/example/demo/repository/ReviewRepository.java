package com.example.demo.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Review;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByReviewer_Id(UUID reviewerId);
    Optional<Review> findByArticle_IdAndReviewer_Id(UUID articleId, UUID reviewerId);
    Optional<Review> findByArticle_Id(UUID articleId);
}
