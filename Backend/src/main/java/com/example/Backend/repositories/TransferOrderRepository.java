package com.example.Backend.repositories;

import com.example.Backend.Models.TransferOrder;
import com.example.Backend.Models.TransferOrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TransferOrderRepository extends MongoRepository<TransferOrder, String> {
    List<TransferOrder> findByStatus(TransferOrderStatus status);
    List<TransferOrder> findByBranchId(String branchId);
    List<TransferOrder> findByWarehouseId(String warehouseId);
    List<TransferOrder> findByBranchIdAndStatus(String branchId, TransferOrderStatus status);
    List<TransferOrder> findByWarehouseIdAndStatus(String warehouseId, TransferOrderStatus status);
}
