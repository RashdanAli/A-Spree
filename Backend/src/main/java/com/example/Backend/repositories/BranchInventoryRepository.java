package com.example.Backend.repositories;

import com.example.Backend.Models.BranchInventory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BranchInventoryRepository extends MongoRepository<BranchInventory, String> {
    List<BranchInventory> findByBranchId(String branchId);
    Optional<BranchInventory> findByBranchIdAndProductIdAndBatchId(
        String branchId, String productId, String batchId
    );
}
