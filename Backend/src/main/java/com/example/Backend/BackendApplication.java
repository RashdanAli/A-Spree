package com.example.Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


import com.example.Backend.Models.User; // Fix the package name here
import com.example.Backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner init(UserRepository repo) {
        return args -> {
            if (!repo.existsByEmail("test@aspree.com")) {
                User testUser = new User();
                testUser.setName("Test Connection");
                testUser.setEmail("test@aspree.com");
                repo.save(testUser);
                System.out.println("Database Connection Verified: User Saved!");
            } else {
                System.out.println("Database Connection Verified: MongoDB is reachable.");
            }
        };
    }
}
