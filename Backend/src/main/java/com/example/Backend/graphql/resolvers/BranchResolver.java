package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.Branch;
import com.example.Backend.Models.User;
import com.example.Backend.repositories.BranchRepository;
import com.example.Backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.BatchMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Controller
public class BranchResolver {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private UserRepository userRepository;

    @QueryMapping
    public Branch branch(@Argument String id) {
        return branchRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Branch> branches() {
        return branchRepository.findAll();
    }

    @QueryMapping
    public List<Branch> nearestBranches(@Argument Double lat, @Argument Double lng, @Argument Double radiusKm) {
        // Approximate bounding box; proper geo query added in Phase 4
        double latDelta = radiusKm / 111.0;
        double lngDelta = radiusKm / (111.0 * Math.cos(Math.toRadians(lat)));
        return branchRepository.findByLatitudeBetweenAndLongitudeBetween(
                lat - latDelta, lat + latDelta,
                lng - lngDelta, lng + lngDelta);
    }

    @MutationMapping
    public Branch createBranch(@Argument Map<String, Object> input) {
        Branch branch = new Branch();
        mapBranchInput(branch, input);
        return branchRepository.save(branch);
    }

    @MutationMapping
    public Branch updateBranch(@Argument String id, @Argument Map<String, Object> input) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
        mapBranchInput(branch, input);
        return branchRepository.save(branch);
    }

    private void mapBranchInput(Branch branch, Map<String, Object> input) {
        if (input.containsKey("name")) branch.setName((String) input.get("name"));
        if (input.containsKey("address")) branch.setAddress((String) input.get("address"));
        if (input.containsKey("managerId")) branch.setManagerId((String) input.get("managerId"));
        if (input.containsKey("latitude") && input.get("latitude") != null)
            branch.setLatitude(((Number) input.get("latitude")).doubleValue());
        if (input.containsKey("longitude") && input.get("longitude") != null)
            branch.setLongitude(((Number) input.get("longitude")).doubleValue());
    }

    // DataLoader: resolves Branch.manager for a list of branches in one query
    @BatchMapping
    public Map<Branch, User> manager(List<Branch> branches) {
        List<String> ids = branches.stream()
                .map(Branch::getManagerId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<String, User> byId = userRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Map<Branch, User> result = new LinkedHashMap<>();
        for (Branch b : branches) {
            result.put(b, byId.get(b.getManagerId()));
        }
        return result;
    }
}
