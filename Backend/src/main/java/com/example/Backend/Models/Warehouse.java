package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "warehouses")
public class Warehouse {

    @Id
    private String id;
    
    private String name;
    private String address;
    private String managerId; // Links to the User collection (WAREHOUSE_MANAGER)
}