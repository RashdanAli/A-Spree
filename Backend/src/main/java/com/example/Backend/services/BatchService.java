package com.example.Backend.services;

import com.example.Backend.Models.Batch;
import com.example.Backend.repositories.BatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class BatchService {

    @Autowired
    private BatchRepository batchRepository;

    public Batch createBatch(Map<String, Object> input) {
        Batch batch = new Batch();
        batch.setBatchNumber((String) input.get("batchNumber"));
        batch.setProductId((String) input.get("productId"));
        
        if (input.get("quantity") != null) {
            batch.setQuantity((Integer) input.get("quantity"));
        }
        
        if (input.get("receivedDate") != null) {
            batch.setReceivedDate(LocalDate.parse((String) input.get("receivedDate")));
        } else {
            batch.setReceivedDate(LocalDate.now());
        }
        
        if (input.get("expiryDate") != null) {
            batch.setExpiryDate(LocalDate.parse((String) input.get("expiryDate")));
        }
        
        if (input.get("costPrice") != null) {
            batch.setCostPrice(((Number) input.get("costPrice")).doubleValue());
        }
        
        // Initial flag calculation
        updateExpiryFlags(batch);
        
        return batchRepository.save(batch);
    }

    public List<Batch> getBatchesByExpiry(Integer daysUntilExpiry) {
        if (daysUntilExpiry == null) {
            daysUntilExpiry = 7;
        }
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(daysUntilExpiry);
        return batchRepository.findByExpiryDateBetween(today, cutoff);
    }

    public void flagExpiringBatches() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysFromNow = today.plusDays(7);
        
        // Find all batches expiring within 7 days from today
        List<Batch> expiringBatches = batchRepository.findByExpiryDateBetween(today, sevenDaysFromNow);
        
        for (Batch batch : expiringBatches) {
            updateExpiryFlags(batch);
        }
        
        if (!expiringBatches.isEmpty()) {
            batchRepository.saveAll(expiringBatches);
            System.out.println("Flagged " + expiringBatches.size() + " expiring batches.");
        }
    }
    
    private void updateExpiryFlags(Batch batch) {
        if (batch.getExpiryDate() == null) return;
        
        LocalDate today = LocalDate.now();
        long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(today, batch.getExpiryDate());
        
        batch.setExpiringIn7Days(daysUntilExpiry >= 0 && daysUntilExpiry <= 7);
        batch.setExpiringIn3Days(daysUntilExpiry >= 0 && daysUntilExpiry <= 3);
    }
}
