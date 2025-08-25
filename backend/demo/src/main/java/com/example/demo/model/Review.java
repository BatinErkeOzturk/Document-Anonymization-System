package com.example.demo.model;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reviews")
@JsonIgnoreProperties({"article", "reviewer"})
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "article_id", nullable = false)
    @JsonManagedReference
    private Article article;

    @ManyToOne
    @JoinColumn(name = "reviewer_id", nullable = false)
    @JsonManagedReference
    private Reviewer reviewer;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String comments;

    @Column(nullable = true)
    private int rating; // 1-10 ölçeğinde değerlendirme

    @Column(nullable = false, columnDefinition = "TIMESTAMP")
    private LocalDateTime createdAt = LocalDateTime.now();

    public UUID getArticleId() {
        return article != null ? article.getId() : null;
    }

    public UUID getReviewerId() {
        return reviewer != null ? reviewer.getId() : null;
    }

}
