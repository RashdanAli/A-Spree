package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.User;
import com.example.Backend.dto.AuthResponse;
import com.example.Backend.repositories.UserRepository;
import com.example.Backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class AuthResolver {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @MutationMapping
    public AuthResponse register(@Argument Map<String, Object> input) {
        String name = (String) input.get("name");
        String email = (String) input.get("email");
        String password = (String) input.get("password");
        String roleStr = (String) input.get("role");

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email is already taken!");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        if (roleStr != null) {
            user.setRole(com.example.Backend.Models.Role.valueOf(roleStr));
        } else {
            user.setRole(com.example.Backend.Models.Role.CUSTOMER);
        }
        user.setMockWalletBalance(0.0);
        userRepository.save(user);

        String token = jwtUtil.generateToken(email, user.getRole().toString());
        return new AuthResponse(token, email, user.getRole().toString());
    }

    @MutationMapping
    public AuthResponse login(@Argument Map<String, Object> input) {
        String email = (String) input.get("email");
        String password = (String) input.get("password");

        if (email == null || password == null) {
            throw new RuntimeException("Email and password are required");
        }

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(email, user.getRole().toString());
        return new AuthResponse(token, email, user.getRole().toString());
    }
}
