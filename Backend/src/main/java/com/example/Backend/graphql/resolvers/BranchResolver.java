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
        return null;
    }

    @MutationMapping
    public Branch updateBranch(@Argument String id, @Argument Map<String, Object> input) {
        return null;
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
