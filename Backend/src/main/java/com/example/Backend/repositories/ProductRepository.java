package com.example.Backend.repositories;

import com.example.Backend.Models.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    Optional<Product> findBySku(String sku);
    List<Product> findByCategory(String category);
    List<Product> findByIsArchivedFalse();
    List<Product> findByCategoryAndIsArchivedFalse(String category);
    List<Product> findByNameContainingIgnoreCaseAndIsArchivedFalse(String name);
}
