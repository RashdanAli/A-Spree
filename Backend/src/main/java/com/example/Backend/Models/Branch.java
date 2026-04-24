package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "branches")
public class Branch {

    @Id
    private String id;
    
    private String name;
    private String address;
    private String managerId; // Links to the User collection (BRANCH_MANAGER)
    
    // Crucial for Phase 4: nearestBranches(lat, lng, radiusKm)
    private Double latitude;
    private Double longitude;
}