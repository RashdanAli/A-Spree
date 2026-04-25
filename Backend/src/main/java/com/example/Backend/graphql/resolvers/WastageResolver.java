package com.example.Backend.graphql.resolvers;

import com.example.Backend.Models.Product;
import com.example.Backend.Models.WastageReport;
import com.example.Backend.repositories.ProductRepository;
import com.example.Backend.repositories.WastageReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.BatchMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Controller
public class WastageResolver {

    @Autowired
    private WastageReportRepository wastageReportRepository;

    @Autowired
    private ProductRepository productRepository;

    @QueryMapping
    public List<WastageReport> wastageByBranch(
            @Argument String branchId,
            @Argument String dateRangeStart,
            @Argument String dateRangeEnd) {

        if (dateRangeStart != null && dateRangeEnd != null) {
            LocalDateTime start = LocalDateTime.parse(dateRangeStart);
            LocalDateTime end = LocalDateTime.parse(dateRangeEnd);
            return wastageReportRepository.findByBranchIdAndReportedAtBetween(branchId, start, end);
        }
        return wastageReportRepository.findByBranchId(branchId);
    }

    @MutationMapping
    public WastageReport reportWastage(@Argument Map<String, Object> input) {
        return null;
    }

    // DataLoader: resolves WastageReport.product for a list of reports in one query
    @BatchMapping
    public Map<WastageReport, Product> product(List<WastageReport> reports) {
        List<String> ids = reports.stream()
                .map(WastageReport::getProductId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<String, Product> byId = productRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        Map<WastageReport, Product> result = new LinkedHashMap<>();
        for (WastageReport r : reports) {
            result.put(r, byId.get(r.getProductId()));
        }
        return result;
    }
}
