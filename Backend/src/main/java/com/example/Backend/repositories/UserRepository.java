package com.example.Backend.repositories;

import com.example.Backend.Models.User; // Note: Ensure 'models' matches your folder case
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    
    // Crucial for Auth: Find a user by email to verify credentials
    Optional<User> findByEmail(String email);
    
    // Helpful for Registration: Check if an email is already taken
    Boolean existsByEmail(String email);
}