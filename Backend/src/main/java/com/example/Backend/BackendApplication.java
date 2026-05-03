package com.example.Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.example.Backend.Models.User;
import com.example.Backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner init(UserRepository repo, PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed WAREHOUSE_MANAGER account
            if (!repo.existsByEmail("warehouse@aspree.com")) {
                User wm = new User();
                wm.setName("Warehouse Manager");
                wm.setEmail("warehouse@aspree.com");
                wm.setPassword(passwordEncoder.encode("Warehouse123!"));
                wm.setRole(com.example.Backend.Models.Role.WAREHOUSE_MANAGER);
                wm.setMockWalletBalance(0.0);
                repo.save(wm);
                System.out.println("Seeded: warehouse@aspree.com (WAREHOUSE_MANAGER)");
            }
            // Seed SUPER_ADMIN account
            if (!repo.existsByEmail("admin@aspree.com")) {
                User admin = new User();
                admin.setName("Super Admin");
                admin.setEmail("admin@aspree.com");
                admin.setPassword(passwordEncoder.encode("Admin123!"));
                admin.setRole(com.example.Backend.Models.Role.SUPER_ADMIN);
                admin.setMockWalletBalance(0.0);
                repo.save(admin);
                System.out.println("Seeded: admin@aspree.com (SUPER_ADMIN)");
            }
            System.out.println("Database Connection Verified: MongoDB is reachable.");
        };
    }
}
