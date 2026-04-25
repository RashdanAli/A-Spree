package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.Batch;
import com.example.Backend.Models.Product;
import com.example.Backend.repositories.BatchRepository;
import com.example.Backend.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.BatchMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class ProductResolver {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BatchRepository batchRepository;

    @QueryMapping
    public Product product(@Argument String id) {
        return productRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public Product productBySku(@Argument String sku) {
        return productRepository.findBySku(sku).orElse(null);
    }

    @QueryMapping
    public List<Product> products(@Argument String category, @Argument Integer page, @Argument Integer limit) {
        return Collections.emptyList();
    }

    @QueryMapping
    public List<Product> searchProducts(@Argument String query, @Argument String branchId) {
        return Collections.emptyList();
    }

    @MutationMapping
    public Product createProduct(@Argument Map<String, Object> input) {
        return null;
    }

    @MutationMapping
    public Product updateProduct(@Argument String id, @Argument Map<String, Object> input) {
        return null;
    }

    @MutationMapping
    public Product archiveProduct(@Argument String id) {
        return null;
    }

    @MutationMapping
    public Product setPromotion(@Argument String productId, @Argument Double discountPct, @Argument String expiresAt) {
        return null;
    }

    // DataLoader: resolves Product.batches for a list of products in one query
    @BatchMapping
    public Map<Product, List<Batch>> batches(List<Product> products) {
        List<String> ids = products.stream().map(Product::getId).collect(Collectors.toList());
        List<Batch> allBatches = batchRepository.findByProductIdIn(ids);
        Map<String, List<Batch>> byProductId = allBatches.stream()
                .collect(Collectors.groupingBy(Batch::getProductId));
        Map<Product, List<Batch>> result = new LinkedHashMap<>();
        for (Product p : products) {
            result.put(p, byProductId.getOrDefault(p.getId(), Collections.emptyList()));
        }
        return result;
    }
}
