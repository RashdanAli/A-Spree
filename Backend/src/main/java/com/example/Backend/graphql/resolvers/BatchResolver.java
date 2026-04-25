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

import java.time.LocalDate;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Controller
public class BatchResolver {

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private ProductRepository productRepository;

    @QueryMapping
    public Batch batch(@Argument String id) {
        return batchRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Batch> batches(@Argument String productId) {
        return batchRepository.findByProductId(productId);
    }

    @QueryMapping
    public List<Batch> batchesByExpiry(@Argument Integer daysUntilExpiry) {
        LocalDate cutoff = LocalDate.now().plusDays(daysUntilExpiry);
        return batchRepository.findByExpiryDateBetween(LocalDate.now(), cutoff);
    }

    @MutationMapping
    public Batch createBatch(@Argument Map<String, Object> input) {
        return null;
    }

    // DataLoader: resolves Batch.product for a list of batches in one query
    @BatchMapping
    public Map<Batch, Product> product(List<Batch> batches) {
        List<String> ids = batches.stream()
                .map(Batch::getProductId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<String, Product> byId = productRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        Map<Batch, Product> result = new LinkedHashMap<>();
        for (Batch b : batches) {
            result.put(b, byId.get(b.getProductId()));
        }
        return result;
    }
}
