package com.example.Backend.repositories;

import com.example.Backend.Models.ScanLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ScanLogRepository extends MongoRepository<ScanLog, String> {
    List<ScanLog> findByBranchId(String branchId);
    List<ScanLog> findByProductId(String productId);
}
