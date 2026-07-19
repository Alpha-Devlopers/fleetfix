package com.fleetfix.backend.controller;

import com.fleetfix.backend.dto.common.ApiResponse;
import com.fleetfix.backend.dto.common.PageResponse;
import com.fleetfix.backend.dto.inventory.InventoryRequest;
import com.fleetfix.backend.dto.inventory.InventoryResponse;
import com.fleetfix.backend.dto.inventory.ReservePartsRequest;
import com.fleetfix.backend.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Spare parts inventory management endpoints")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MECHANIC')")
    @Operation(summary = "Add a new spare part to inventory")
    public ResponseEntity<ApiResponse<InventoryResponse>> addPart(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Part added to inventory", inventoryService.addPart(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MECHANIC')")
    @Operation(summary = "Update an inventory part")
    public ResponseEntity<ApiResponse<InventoryResponse>> updatePart(@PathVariable Long id,
                                                                      @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Part updated", inventoryService.updatePart(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a spare part from inventory")
    public ResponseEntity<ApiResponse<Void>> deletePart(@PathVariable Long id) {
        inventoryService.deletePart(id);
        return ResponseEntity.ok(ApiResponse.success("Part deleted", null));
    }

    @GetMapping
    @Operation(summary = "View inventory with pagination and sorting")
    public ResponseEntity<ApiResponse<PageResponse<InventoryResponse>>> listInventory(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(inventoryService.listInventory(pageable))));
    }

    @PostMapping("/{id}/reserve")
    @PreAuthorize("hasAnyRole('ADMIN','MECHANIC','DISPATCHER')")
    @Operation(summary = "Reserve parts from inventory")
    public ResponseEntity<ApiResponse<InventoryResponse>> reserveParts(@PathVariable Long id,
                                                                        @Valid @RequestBody ReservePartsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Parts reserved", inventoryService.reserveParts(id, request)));
    }

    @PostMapping("/{id}/release")
    @PreAuthorize("hasAnyRole('ADMIN','MECHANIC','DISPATCHER')")
    @Operation(summary = "Release reserved parts back into available inventory")
    public ResponseEntity<ApiResponse<InventoryResponse>> releaseReservedParts(@PathVariable Long id,
                                                                                @Valid @RequestBody ReservePartsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Reserved parts released", inventoryService.releaseReservedParts(id, request)));
    }
}
