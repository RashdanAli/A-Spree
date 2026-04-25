package com.example.Backend.repositories;

import com.example.Backend.Models.Batch;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BatchRepository extends MongoRepository<Batch, String> {
    List<Batch> findByProductId(String productId);
    List<Batch> findByProductIdIn(List<String> productIds);
    List<Batch> findByExpiryDateBefore(LocalDate date);
    List<Batch> findByExpiryDateBetween(LocalDate start, LocalDate end);
}
