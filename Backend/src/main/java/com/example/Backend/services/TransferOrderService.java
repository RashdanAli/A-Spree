package com.example.Backend.services;

import com.example.Backend.Models.Batch;
import com.example.Backend.Models.TransferOrder;
import com.example.Backend.Models.TransferOrderStatus;
import com.example.Backend.repositories.BatchRepository;
import com.example.Backend.repositories.TransferOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TransferOrderService {

    @Autowired
    private TransferOrderRepository transferOrderRepository;

    @Autowired
    private BatchRepository batchRepository;

    @SuppressWarnings("unchecked")
    public TransferOrder createTransferOrder(Map<String, Object> input) {
        TransferOrder order = new TransferOrder();

        order.setWarehouseId((String) input.get("warehouseId"));
        order.setBranchId((String) input.get("branchId"));

        if (input.get("estimatedDeliveryDate") != null) {
            order.setEstimatedDeliveryDate(LocalDate.parse((String) input.get("estimatedDeliveryDate")));
        }

        List<Map<String, Object>> itemsInput = (List<Map<String, Object>>) input.get("items");
        List<TransferOrder.OrderItem> orderItems = new ArrayList<>();

        if (itemsInput != null) {
            for (Map<String, Object> itemInput : itemsInput) {
                TransferOrder.OrderItem item = new TransferOrder.OrderItem();
                item.setProductId((String) itemInput.get("productId"));
                item.setBatchId((String) itemInput.get("batchId"));
                item.setQuantity((Integer) itemInput.get("quantity"));
                orderItems.add(item);
            }
        }

        order.setItems(orderItems);
        order.setStatus(TransferOrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        return transferOrderRepository.save(order);
    }

    public TransferOrder dispatchTransferOrder(String id) {
        Optional<TransferOrder> optionalOrder = transferOrderRepository.findById(id);
        if (optionalOrder.isEmpty()) {
            throw new RuntimeException("TransferOrder not found with id: " + id);
        }

        TransferOrder order = optionalOrder.get();
        if (order.getStatus() != TransferOrderStatus.PENDING) {
            throw new RuntimeException("Only PENDING orders can be dispatched. Current status: " + order.getStatus());
        }

        // Deduct quantities from warehouse batches
        for (TransferOrder.OrderItem item : order.getItems()) {
            Optional<Batch> optionalBatch = batchRepository.findById(item.getBatchId());
            if (optionalBatch.isEmpty()) {
                throw new RuntimeException("Batch not found with id: " + item.getBatchId());
            }

            Batch batch = optionalBatch.get();
            if (batch.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock in batch " + batch.getBatchNumber()
                        + ". Requested: " + item.getQuantity() + ", Available: " + batch.getQuantity());
            }

            batch.setQuantity(batch.getQuantity() - item.getQuantity());
            batchRepository.save(batch);
        }

        order.setStatus(TransferOrderStatus.DISPATCHED);
        order.setDispatchedAt(LocalDateTime.now());
        return transferOrderRepository.save(order);
    }

    public TransferOrder receiveTransferOrder(String id) {
        Optional<TransferOrder> optionalOrder = transferOrderRepository.findById(id);
        if (optionalOrder.isEmpty()) {
            throw new RuntimeException("TransferOrder not found with id: " + id);
        }

        TransferOrder order = optionalOrder.get();
        if (order.getStatus() != TransferOrderStatus.DISPATCHED) {
            throw new RuntimeException("Only DISPATCHED orders can be received. Current status: " + order.getStatus());
        }

        order.setStatus(TransferOrderStatus.RECEIVED);
        order.setReceivedAt(LocalDateTime.now());

        // Note: The actual incrementing of Branch Inventory logic will be implemented
        // in Phase 3 (Branch side implementation)

        return transferOrderRepository.save(order);
    }
}
