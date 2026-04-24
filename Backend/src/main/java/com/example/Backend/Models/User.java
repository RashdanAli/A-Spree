package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String password; // Will store the hashed password
    private String name;
    private Role role;
    
    // For Phase 4: Mock Wallet
    private Double mockWalletBalance = 0.0;
    private String fcmToken; // For Phase 5 ML Notifications
}