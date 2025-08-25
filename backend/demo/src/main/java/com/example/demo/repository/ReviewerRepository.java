package com.example.demo.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Reviewer;

@Repository
public interface ReviewerRepository extends JpaRepository<Reviewer, UUID> {
    List<Reviewer> findByInterestField(String interestField);
    Optional<Reviewer> findByEmail(String email);
}
