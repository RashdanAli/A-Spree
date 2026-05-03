package com.example.Backend.services;

import com.example.Backend.Models.Product;
import com.example.Backend.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PricingService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Sets a promotional discount on a product.
     *
     * @param productId   the product to promote
     * @param discountPct discount percentage as a decimal (e.g. 0.15 = 15%)
     * @param expiresAt   ISO date string (yyyy-MM-dd) when the promotion
     *                    auto-expires
     */
    public Product setPromotion(String productId, Double discountPct, String expiresAt) {
        Optional<Product> optionalProduct = productRepository.findById(productId);
        if (optionalProduct.isEmpty()) {
            throw new RuntimeException("Product not found with id: " + productId);
        }

        Product product = optionalProduct.get();

        if (discountPct < 0 || discountPct > 1) {
            throw new RuntimeException("discountPct must be a decimal between 0.0 and 1.0 (e.g. 0.15 for 15%)");
        }

        // Validate the date format
        LocalDate.parse(expiresAt); // throws if invalid

        product.setDiscountPct(discountPct);
        product.setPromotionExpiresAt(expiresAt); // stored as ISO String

        return productRepository.save(product);
    }

    /**
     * Sets the markup percentage on a product.
     *
     * @param productId the product to update
     * @param markupPct markup as a decimal (e.g. 0.20 = 20%)
     */
    public Product setMarkup(String productId, Double markupPct) {
        Optional<Product> optionalProduct = productRepository.findById(productId);
        if (optionalProduct.isEmpty()) {
            throw new RuntimeException("Product not found with id: " + productId);
        }

        Product product = optionalProduct.get();

        if (markupPct < 0) {
            throw new RuntimeException("markupPct cannot be negative");
        }

        product.setMarkupPct(markupPct);
        return productRepository.save(product);
    }

    /**
     * Nightly job helper: expires all promotions whose promotionExpiresAt date has
     * passed.
     * Called by ExpiryScheduler.
     */
    public void expireOutdatedPromotions() {
        List<Product> products = productRepository.findByIsArchivedFalse();
        LocalDate today = LocalDate.now();

        int expiredCount = 0;
        for (Product product : products) {
            String expiresAt = product.getPromotionExpiresAt();
            if (expiresAt != null
                    && !LocalDate.parse(expiresAt).isAfter(today)
                    && product.getDiscountPct() != null
                    && product.getDiscountPct() > 0) {

                product.setDiscountPct(0.0);
                product.setPromotionExpiresAt(null);
                productRepository.save(product);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            System.out.println("Expired " + expiredCount + " outdated promotions.");
        }
    }
}
