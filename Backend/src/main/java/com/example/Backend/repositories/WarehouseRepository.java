package com.example.Backend.repositories;

import com.example.Backend.Models.Warehouse;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WarehouseRepository extends MongoRepository<Warehouse, String> {
}
