package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.User;
import com.example.Backend.Models.Warehouse;
import com.example.Backend.repositories.UserRepository;
import com.example.Backend.repositories.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.BatchMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Controller
public class WarehouseResolver {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private UserRepository userRepository;

    @QueryMapping
    public Warehouse warehouse(@Argument String id) {
        return warehouseRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Warehouse> warehouses() {
        return warehouseRepository.findAll();
    }

    @MutationMapping
    public Warehouse createWarehouse(@Argument Map<String, Object> input) {
        return null;
    }

    // DataLoader: resolves Warehouse.manager for a list of warehouses in one query
    @BatchMapping
    public Map<Warehouse, User> manager(List<Warehouse> warehouses) {
        List<String> ids = warehouses.stream()
                .map(Warehouse::getManagerId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<String, User> byId = userRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Map<Warehouse, User> result = new LinkedHashMap<>();
        for (Warehouse w : warehouses) {
            result.put(w, byId.get(w.getManagerId()));
        }
        return result;
    }
}
