package com.example.Backend.repositories;

import com.example.Backend.Models.WastageReport;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface WastageReportRepository extends MongoRepository<WastageReport, String> {
    List<WastageReport> findByBranchId(String branchId);
    List<WastageReport> findByBranchIdAndReportedAtBetween(
        String branchId,
        LocalDateTime start,
        LocalDateTime end
    );
}
