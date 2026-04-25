package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "wastage_reports")
@CompoundIndex(def = "{'branchId': 1, 'reportedAt': -1}")
public class WastageReport {

    @Id
    private String id;

    private String branchId;
    private String batchId;
    private String productId;
    private Integer quantity;
    private WastageReason reason;
    private String reportedBy;
    private LocalDateTime reportedAt = LocalDateTime.now();
}
