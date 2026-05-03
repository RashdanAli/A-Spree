package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.Branch;
import com.example.Backend.Models.TransferOrder;
import com.example.Backend.Models.TransferOrderStatus;
import com.example.Backend.Models.Warehouse;
import com.example.Backend.repositories.BranchRepository;
import com.example.Backend.repositories.TransferOrderRepository;
import com.example.Backend.repositories.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.BatchMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import com.example.Backend.services.TransferOrderService;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Controller
public class TransferOrderResolver {

    @Autowired
    private TransferOrderRepository transferOrderRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private TransferOrderService transferOrderService;

    @QueryMapping
    public TransferOrder transferOrder(@Argument String id) {
        return transferOrderRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<TransferOrder> transferOrders(
            @Argument TransferOrderStatus status,
            @Argument String branchId,
            @Argument String warehouseId) {

        if (status != null) {
            if (branchId != null)
                return transferOrderRepository.findByBranchIdAndStatus(branchId, status);
            if (warehouseId != null)
                return transferOrderRepository.findByWarehouseIdAndStatus(warehouseId, status);
            return transferOrderRepository.findByStatus(status);
        }
        if (branchId != null)
            return transferOrderRepository.findByBranchId(branchId);
        if (warehouseId != null)
            return transferOrderRepository.findByWarehouseId(warehouseId);
        return Collections.emptyList();
    }

    @MutationMapping
    public TransferOrder createTransferOrder(@Argument Map<String, Object> input) {
        return transferOrderService.createTransferOrder(input);
    }

    @MutationMapping
    public TransferOrder dispatchTransferOrder(@Argument String id) {
        return transferOrderService.dispatchTransferOrder(id);
    }

    @MutationMapping
    public TransferOrder receiveTransferOrder(@Argument String id) {
        return transferOrderService.receiveTransferOrder(id);
    }

    // DataLoader: resolves TransferOrder.branch for a list of orders in one query
    @BatchMapping
    public Map<TransferOrder, Branch> branch(List<TransferOrder> orders) {
        List<String> ids = orders.stream()
                .map(TransferOrder::getBranchId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<String, Branch> byId = branchRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(Branch::getId, b -> b));
        Map<TransferOrder, Branch> result = new LinkedHashMap<>();
        for (TransferOrder o : orders) {
            result.put(o, byId.get(o.getBranchId()));
        }
        return result;
    }

    // DataLoader: resolves TransferOrder.warehouse for a list of orders in one
    // query
    @BatchMapping
    public Map<TransferOrder, Warehouse> warehouse(List<TransferOrder> orders) {
        List<String> ids = orders.stream()
                .map(TransferOrder::getWarehouseId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<String, Warehouse> byId = warehouseRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(Warehouse::getId, w -> w));
        Map<TransferOrder, Warehouse> result = new LinkedHashMap<>();
        for (TransferOrder o : orders) {
            result.put(o, byId.get(o.getWarehouseId()));
        }
        return result;
    }
}
