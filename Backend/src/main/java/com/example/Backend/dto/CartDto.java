package com.example.Backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class CartDto {

    private String id;
    private String branchId;
    private List<CartItem> items;
    private Double totalAmount;

    @Data
    public static class CartItem {
        private String productId;
        private String batchId;
        private String sku;
        private Integer quantity;
        private Double unitPrice;
    }
}
