package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.BranchInventory;
import com.example.Backend.dto.CartDto;
import com.example.Backend.dto.ReceiptDto;
import com.example.Backend.repositories.BranchInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class PosResolver {

    @Autowired
    private BranchInventoryRepository branchInventoryRepository;

    @QueryMapping
    public List<BranchInventory> branchInventory(@Argument String branchId) {
        return branchInventoryRepository.findByBranchId(branchId);
    }

    // POS mutations — full implementation in Phase 3
    @MutationMapping
    public CartDto createCart(@Argument String branchId) {
        return null;
    }

    @MutationMapping
    public CartDto addItemToCart(@Argument String cartId, @Argument String sku, @Argument Integer quantity) {
        return null;
    }

    @MutationMapping
    public ReceiptDto checkoutCart(@Argument String cartId, @Argument String paymentType) {
        return null;
    }

    @MutationMapping
    public BranchInventory moveToShelf(@Argument String branchId, @Argument String batchId, @Argument Integer quantity) {
        return null;
    }
}
