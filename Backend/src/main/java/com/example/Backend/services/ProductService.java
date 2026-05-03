package com.example.Backend.services;

import com.example.Backend.Models.Product;
import com.example.Backend.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product createProduct(Map<String, Object> input) {
        Product product = new Product();

        String sku = (String) input.get("sku");
        if (sku == null || sku.trim().isEmpty()) {
            sku = "PRD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        product.setSku(sku);

        product.setName((String) input.get("name"));
        product.setCategory((String) input.get("category"));
        product.setUnitOfMeasurement((String) input.get("unitOfMeasurement"));
        product.setNutritionalInfo((String) input.get("nutritionalInfo"));

        if (input.get("basePrice") != null) {
            product.setBasePrice(((Number) input.get("basePrice")).doubleValue());
        }

        product.setArchived(false);
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Map<String, Object> input) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            throw new RuntimeException("Product not found with id: " + id);
        }

        Product product = optionalProduct.get();

        if (input.containsKey("sku")) {
            product.setSku((String) input.get("sku"));
        }
        if (input.containsKey("name")) {
            product.setName((String) input.get("name"));
        }
        if (input.containsKey("category")) {
            product.setCategory((String) input.get("category"));
        }
        if (input.containsKey("unitOfMeasurement")) {
            product.setUnitOfMeasurement((String) input.get("unitOfMeasurement"));
        }
        if (input.containsKey("nutritionalInfo")) {
            product.setNutritionalInfo((String) input.get("nutritionalInfo"));
        }
        if (input.containsKey("basePrice")) {
            Object bp = input.get("basePrice");
            if (bp != null) {
                product.setBasePrice(((Number) bp).doubleValue());
            } else {
                product.setBasePrice(null);
            }
        }

        return productRepository.save(product);
    }

    public Product archiveProduct(String id) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            throw new RuntimeException("Product not found with id: " + id);
        }

        Product product = optionalProduct.get();
        product.setArchived(true);
        return productRepository.save(product);
    }

    public List<Product> getProducts(String category, Integer page, Integer limit) {
        int pageNum = (page != null && page > 0) ? page - 1 : 0;
        int size = (limit != null && limit > 0) ? limit : 20; // Default limit 20

        Pageable pageable = PageRequest.of(pageNum, size);

        Page<Product> productPage;
        if (category != null && !category.trim().isEmpty()) {
            productPage = productRepository.findByCategoryAndIsArchivedFalse(category, pageable);
        } else {
            productPage = productRepository.findByIsArchivedFalse(pageable);
        }

        return productPage.getContent();
    }
}
