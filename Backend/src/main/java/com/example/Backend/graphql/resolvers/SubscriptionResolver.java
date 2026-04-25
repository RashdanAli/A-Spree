package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.Order;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;

@Controller
public class SubscriptionResolver {

    // Real-time order status — wired to a publisher in Phase 4
    @SubscriptionMapping
    public Flux<Order> subscribeOrderStatus(@Argument String orderId) {
        return Flux.empty();
    }
}
