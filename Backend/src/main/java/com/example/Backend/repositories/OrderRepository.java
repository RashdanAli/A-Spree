package com.example.Backend.repositories;

import com.example.Backend.Models.Order;
import com.example.Backend.Models.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    Page<Order> findByCustomerId(String customerId, Pageable pageable);
    List<Order> findByBranchIdAndStatus(String branchId, OrderStatus status);
    List<Order> findByCustomerIdIn(List<String> customerIds);
    List<Order> findByBranchIdIn(List<String> branchIds);
}
