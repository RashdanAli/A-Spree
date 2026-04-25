package com.example.Backend.repositories;

import com.example.Backend.Models.Branch;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BranchRepository extends MongoRepository<Branch, String> {
    List<Branch> findByManagerId(String managerId);
    List<Branch> findByLatitudeBetweenAndLongitudeBetween(
        Double minLat, Double maxLat,
        Double minLng, Double maxLng
    );
}
