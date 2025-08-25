package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Article;
import com.example.demo.model.Review;
import com.example.demo.model.Reviewer;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.ReviewerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ArticleRepository articleRepository;
    private final ReviewerRepository reviewerRepository;
    private final LogService logService;

    @Transactional
    public Review assignReviewerToArticle(UUID articleId, UUID reviewerId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("Makale bulunamadı: " + articleId));

        Reviewer reviewer = reviewerRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("Hakem bulunamadı: " + reviewerId));

        
        String articleTitle = article.getTitle().replace(" - Anonim", "");
        Article originalArticle = articleRepository.findByTitle(articleTitle);

        if (originalArticle != null) {
            originalArticle.setStatus("UNDER_REVIEW");
            articleRepository.save(originalArticle);
        }

        logService.saveLog(originalArticle.getTitle() + " başlıklı makale " + reviewerId + " idli hakeme atandı.");

        article.setStatus("UNDER_REVIEW");
        articleRepository.save(article);

        Review review = new Review();
        review.setArticle(article);
        review.setReviewer(reviewer);
        review.setCreatedAt(LocalDateTime.now());
        review.setComments(null);
        review.setRating(1);

        
        if (originalArticle != null) {
            Review review2 = new Review();
            review2.setArticle(originalArticle);
            review2.setReviewer(reviewer);
            review2.setCreatedAt(LocalDateTime.now());
            review2.setComments(null); // Yorumlar boş
            review2.setRating(1); // Başlangıç olarak 1

            reviewRepository.saveAll(List.of(review, review2));
        } else {
            reviewRepository.save(review);
        }

        return review;
    }

    public List<Review> getReviewsByReviewer(UUID reviewerId) {
        return reviewRepository.findByReviewer_Id(reviewerId);
    }

    @Transactional
    public void updateReview(UUID articleId, UUID reviewerId, String comments, int rating, String newStatus) {
        Review review = reviewRepository.findByArticle_IdAndReviewer_Id(articleId, reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("Anonim makaleye ait review bulunamadı"));

        review.setComments(comments);
        review.setRating(rating);
        reviewRepository.save(review);

        Article anonymizedArticle = review.getArticle();
        if (anonymizedArticle != null) {
            anonymizedArticle.setStatus(newStatus);
            articleRepository.save(anonymizedArticle);

            String originalTitle = anonymizedArticle.getTitle().replace("- Anonim", "").trim();
            Article originalArticle = articleRepository.findByTitle(originalTitle);

            originalArticle.setStatus(newStatus);
            articleRepository.save(originalArticle);

            Optional<Review> originalReviewOpt = reviewRepository
                    .findByArticle_IdAndReviewer_Id(originalArticle.getId(), reviewerId);
            if (originalReviewOpt.isPresent()) {
                Review originalReview = originalReviewOpt.get();
                originalReview.setComments(comments);
                originalReview.setRating(rating);
                reviewRepository.save(originalReview);
            }

            logService.saveLog(originalArticle.getTitle() + " başlıklı makale " + review.getReviewerId()
                    + " idli hakem tarafından değerlendirildi.");

        }

    }

}
