package com.example.Backend.graphql.resolvers;

import com.example.Backend.dto.AuthResponse;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class AuthResolver {

    // Auth mutations delegate to REST /api/auth endpoints for now.
    // These will be wired to UserService in Phase 2.

    @MutationMapping
    public AuthResponse register(@Argument Map<String, Object> input) {
        return null;
    }

    @MutationMapping
    public AuthResponse login(@Argument Map<String, Object> input) {
        return null;
    }
}
