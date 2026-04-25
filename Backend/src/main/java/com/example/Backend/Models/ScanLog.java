package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "scan_logs")
public class ScanLog {

    @Id
    private String id;

    @Indexed
    private String branchId;

    @Indexed
    private String productId;

    private String batchId;
    private String scannedBy;
    private String action;
    private LocalDateTime scannedAt = LocalDateTime.now();
}
