package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.Notification;
import com.example.Backend.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class NotificationResolver {

    @Autowired
    private NotificationRepository notificationRepository;

    @QueryMapping
    public List<Notification> notifications(@Argument String userId) {
        return notificationRepository.findByUserId(userId);
    }
}
