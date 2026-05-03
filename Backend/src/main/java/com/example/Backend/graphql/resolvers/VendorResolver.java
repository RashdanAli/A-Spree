package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.Vendor;
import com.example.Backend.repositories.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import com.example.Backend.services.VendorService;

import java.util.List;
import java.util.Map;

@Controller
public class VendorResolver {

    @Autowired
    private VendorRepository vendorRepository;

    @QueryMapping
    public Vendor vendor(@Argument String id) {
        return vendorRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Vendor> vendors() {
        return vendorRepository.findAll();
    }

    @Autowired
    private VendorService vendorService;

    @MutationMapping
    public Vendor createVendor(@Argument Map<String, Object> input) {
        return vendorService.createVendor(input);
    }

    @MutationMapping
    public Vendor updateVendor(@Argument String id, @Argument Map<String, Object> input) {
        return vendorService.updateVendor(id, input);
    }

    @MutationMapping
    public boolean deleteVendor(@Argument String id) {
        return vendorService.deleteVendor(id);
    }
}
