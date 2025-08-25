package com.example.demo.repository;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Article;

public interface ArticleRepository extends JpaRepository<Article, UUID> {
    List<Article> findByAuthorId(UUID authorId);
    Article findByTrackingNumber(String trackingNumber);
    Article findByTitle(String title);
}
