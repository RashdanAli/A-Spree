package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @Indexed(unique = true)
    private String sku;

    private String name;
    private String category;
    private String unitOfMeasurement;
    private String nutritionalInfo;
    private Double basePrice;

    // Pricing tiers
    private Double markupPct = 0.0; // e.g. 0.20 = 20% markup
    private Double discountPct = 0.0; // e.g. 0.10 = 10% promotional discount
    private String promotionExpiresAt; // ISO date string (yyyy-MM-dd) when the discount auto-expires

    private boolean isArchived = false; // Soft delete flag

    /**
     * Computed: base_price × (1 + markup) × (1 - discount)
     * Returns null if basePrice is not set.
     */
    public Double getEffectivePrice() {
        if (basePrice == null)
            return null;
        double markup = markupPct != null ? markupPct : 0.0;
        double discount = discountPct != null ? discountPct : 0.0;
        return basePrice * (1 + markup) * (1 - discount);
    }
}