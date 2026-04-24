package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "vendors")
public class Vendor {

    @Id
    private String id;
    
    private String name;
    private String contactEmail;
    private String contactPhone;
    private Integer leadTimeDays; // Estimated days to receive stock
    
    private List<String> suppliedProductIds; // Links to Product collection
}