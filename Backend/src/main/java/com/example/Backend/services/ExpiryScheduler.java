package com.example.Backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ExpiryScheduler {

    @Autowired
    private BatchService batchService;

    @Autowired
    private PricingService pricingService;

    // Run every day at midnight (00:00:00)
    @Scheduled(cron = "0 0 0 * * ?")
    public void flagExpiringBatchesDaily() {
        System.out.println("Running nightly ExpiryScheduler job...");
        batchService.flagExpiringBatches();
        pricingService.expireOutdatedPromotions();
    }
}
