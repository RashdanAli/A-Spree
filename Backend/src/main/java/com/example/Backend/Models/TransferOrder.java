package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "transfer_orders")
public class TransferOrder {

    @Id
    private String id;
    
    private String warehouseId;
    private String branchId;
    
    private List<OrderItem> items;
    
    private LocalDate estimatedDeliveryDate;
    private TransferOrderStatus status = TransferOrderStatus.PENDING;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime dispatchedAt;
    private LocalDateTime receivedAt;

    // Inner class for the items list defined in Phase 2
    @Data
    public static class OrderItem {
        private String productId;
        private String batchId;
        private Integer quantity;
    }
}
