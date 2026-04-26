package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.Branch;
import com.example.Backend.Models.Order;
import com.example.Backend.Models.User;
import com.example.Backend.repositories.BranchRepository;
import com.example.Backend.repositories.OrderRepository;
import com.example.Backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
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
public class OrderResolver {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @QueryMapping
    public Order order(@Argument String id) {
        return orderRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Order> myOrders(@Argument String userId, @Argument Integer page, @Argument Integer limit) {
        int pageNum = page != null ? page : 0;
        int pageSize = limit != null ? limit : 20;
        return orderRepository.findByCustomerId(userId, PageRequest.of(pageNum, pageSize)).getContent();
    }

    @MutationMapping
    public Order createOrder(@Argument Map<String, Object> input) {
        return null;
    }

    @MutationMapping
    public Order updateOrderStatus(@Argument String id, @Argument String status) {
        return null;
    }

    // DataLoader: resolves Order.customer for a list of orders in one query
    @BatchMapping
    public Map<Order, User> customer(List<Order> orders) {
        List<String> ids = orders.stream()
                .map(Order::getCustomerId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<String, User> byId = userRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Map<Order, User> result = new LinkedHashMap<>();
        for (Order o : orders) {
            result.put(o, byId.get(o.getCustomerId()));
        }
        return result;
    }

    // DataLoader: resolves Order.branch for a list of orders in one query
    @BatchMapping
    public Map<Order, Branch> branch(List<Order> orders) {
        List<String> ids = orders.stream()
                .map(Order::getBranchId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<String, Branch> byId = branchRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(Branch::getId, b -> b));
        Map<Order, Branch> result = new LinkedHashMap<>();
        for (Order o : orders) {
            result.put(o, byId.get(o.getBranchId()));
        }
        return result;
    }
}
