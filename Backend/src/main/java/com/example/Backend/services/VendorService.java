package com.example.Backend.services;

import com.example.Backend.Models.Vendor;
import com.example.Backend.repositories.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    public Vendor createVendor(Map<String, Object> input) {
        Vendor vendor = new Vendor();
        mapVendorInput(vendor, input);
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(String id, Map<String, Object> input) {
        Optional<Vendor> optionalVendor = vendorRepository.findById(id);
        if (optionalVendor.isEmpty()) {
            throw new RuntimeException("Vendor not found with id: " + id);
        }

        Vendor vendor = optionalVendor.get();
        mapVendorInput(vendor, input);
        return vendorRepository.save(vendor);
    }

    public boolean deleteVendor(String id) {
        if (!vendorRepository.existsById(id)) {
            throw new RuntimeException("Vendor not found with id: " + id);
        }
        vendorRepository.deleteById(id);
        return true;
    }

    @SuppressWarnings("unchecked")
    private void mapVendorInput(Vendor vendor, Map<String, Object> input) {
        if (input.containsKey("name")) {
            vendor.setName((String) input.get("name"));
        }
        if (input.containsKey("contactEmail")) {
            vendor.setContactEmail((String) input.get("contactEmail"));
        }
        if (input.containsKey("contactPhone")) {
            vendor.setContactPhone((String) input.get("contactPhone"));
        }
        if (input.containsKey("leadTimeDays")) {
            vendor.setLeadTimeDays((Integer) input.get("leadTimeDays"));
        }
        if (input.containsKey("suppliedProductIds")) {
            vendor.setSuppliedProductIds((List<String>) input.get("suppliedProductIds"));
        }
    }
}
