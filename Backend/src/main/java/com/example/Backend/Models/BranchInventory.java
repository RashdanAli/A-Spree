package com.example.Backend.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "branch_inventory")
@CompoundIndex(def = "{'branchId': 1, 'productId': 1, 'batchId': 1}", unique = true)
public class BranchInventory {

    @Id
    private String id;

    private String branchId;
    private String productId;
    private String batchId;
    private Integer onShelfQty = 0;
    private Integer backroomQty = 0;
}
