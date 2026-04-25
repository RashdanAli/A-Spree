package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.User;
import com.example.Backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.util.Collections;
import java.util.List;

@Controller
public class UserResolver {

    @Autowired
    private UserRepository userRepository;

    @QueryMapping
    public User me(@AuthenticationPrincipal String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email).orElse(null);
    }

    @QueryMapping
    public User user(@Argument String id) {
        return userRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<User> users(@Argument String role, @Argument Integer page, @Argument Integer limit) {
        return Collections.emptyList();
    }
}
