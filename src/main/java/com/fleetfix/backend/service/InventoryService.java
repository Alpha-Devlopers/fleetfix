package com.fleetfix.backend.service;

import com.fleetfix.backend.dto.inventory.InventoryRequest;
import com.fleetfix.backend.dto.inventory.InventoryResponse;
import com.fleetfix.backend.dto.inventory.ReservePartsRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InventoryService {
    InventoryResponse addPart(InventoryRequest request);
    InventoryResponse updatePart(Long id, InventoryRequest request);
    void deletePart(Long id);
    Page<InventoryResponse> listInventory(Pageable pageable);
    InventoryResponse reserveParts(Long id, ReservePartsRequest request);
    InventoryResponse releaseReservedParts(Long id, ReservePartsRequest request);
}
