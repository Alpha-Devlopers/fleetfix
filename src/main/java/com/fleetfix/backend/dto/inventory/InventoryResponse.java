package com.fleetfix.backend.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    private Long id;
    private String partNumber;
    private String partName;
    private Integer quantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private String warehouseLocation;
}
