package com.fleetfix.backend.mapper;

import com.fleetfix.backend.dto.inventory.InventoryRequest;
import com.fleetfix.backend.dto.inventory.InventoryResponse;
import com.fleetfix.backend.entity.Inventory;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public Inventory toEntity(InventoryRequest request) {
        return Inventory.builder()
                .partNumber(request.getPartNumber())
                .partName(request.getPartName())
                .quantity(request.getQuantity())
                .reservedQuantity(0)
                .warehouseLocation(request.getWarehouseLocation())
                .build();
    }

    public void updateEntity(Inventory inventory, InventoryRequest request) {
        inventory.setPartNumber(request.getPartNumber());
        inventory.setPartName(request.getPartName());
        inventory.setQuantity(request.getQuantity());
        inventory.setWarehouseLocation(request.getWarehouseLocation());
    }

    public InventoryResponse toResponse(Inventory inventory) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .partNumber(inventory.getPartNumber())
                .partName(inventory.getPartName())
                .quantity(inventory.getQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .availableQuantity(inventory.getQuantity() - inventory.getReservedQuantity())
                .warehouseLocation(inventory.getWarehouseLocation())
                .build();
    }
}
