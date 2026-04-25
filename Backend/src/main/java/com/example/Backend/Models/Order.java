package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "orders")
@CompoundIndexes({
    @CompoundIndex(def = "{'customerId': 1, 'status': 1}"),
    @CompoundIndex(def = "{'branchId': 1, 'status': 1}")
})
public class Order {

    @Id
    private String id;

    private String customerId;
    private String branchId;
    private List<OrderLineItem> items;
    private Double totalAmount;
    private OrderStatus status = OrderStatus.PLACED;
    private PaymentType paymentType;
    private OrderType orderType;
    private String deliveryAddress;
    private LocalDateTime createdAt = LocalDateTime.now();

    @Data
    public static class OrderLineItem {
        private String productId;
        private String batchId;
        private Integer quantity;
        private Double unitPrice;
    }
}
