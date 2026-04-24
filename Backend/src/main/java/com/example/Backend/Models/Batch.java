package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Data
@Document(collection = "batches")
public class Batch {

    @Id
    private String id;

    @Indexed
    private String batchNumber;

    @Indexed
    private String productId; // Links to the Product collection

    private Integer quantity;
    private LocalDate receivedDate;

    @Indexed // Crucial for your nightly ExpiryScheduler
    private LocalDate expiryDate;

    private Double costPrice;
}