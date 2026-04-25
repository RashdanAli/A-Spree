package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String productId;
    private String message;
    private Double discountPct;
    private LocalDateTime sentAt = LocalDateTime.now();
    private Boolean isRead = false;
    private Boolean isConverted = false;
}
