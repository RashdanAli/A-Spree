package com.example.Backend.dto;

import com.example.Backend.Models.PaymentType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReceiptDto {

    private String orderId;
    private Double totalAmount;
    private PaymentType paymentType;
    private List<CartDto.CartItem> items;
    private LocalDateTime createdAt;
}
