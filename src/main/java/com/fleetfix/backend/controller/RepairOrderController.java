package com.fleetfix.backend.controller;

import com.fleetfix.backend.dto.common.ApiResponse;
import com.fleetfix.backend.dto.common.PageResponse;
import com.fleetfix.backend.dto.repair.AssignMechanicRequest;
import com.fleetfix.backend.dto.repair.RepairOrderRequest;
import com.fleetfix.backend.dto.repair.RepairOrderResponse;
import com.fleetfix.backend.dto.repair.RepairStatusUpdateRequest;
import com.fleetfix.backend.service.RepairOrderService;
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
@RequestMapping("/api/repair-orders")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Tag(name = "Repair Orders", description = "Repair order management endpoints")
public class RepairOrderController {

    private final RepairOrderService repairOrderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    @Operation(summary = "Create a repair order")
    public ResponseEntity<ApiResponse<RepairOrderResponse>> createRepairOrder(@Valid @RequestBody RepairOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Repair order created", repairOrderService.createRepairOrder(request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','MECHANIC')")
    @Operation(summary = "Update repair order status")
    public ResponseEntity<ApiResponse<RepairOrderResponse>> updateStatus(@PathVariable Long id,
                                                                          @Valid @RequestBody RepairStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Repair order status updated", repairOrderService.updateStatus(id, request)));
    }

    @PatchMapping("/{id}/assign-mechanic")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    @Operation(summary = "Assign a mechanic to a repair order")
    public ResponseEntity<ApiResponse<RepairOrderResponse>> assignMechanic(@PathVariable Long id,
                                                                            @Valid @RequestBody AssignMechanicRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Mechanic assigned", repairOrderService.assignMechanic(id, request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get repair order details")
    public ResponseEntity<ApiResponse<RepairOrderResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(repairOrderService.getById(id)));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Get repair order history for a vehicle")
    public ResponseEntity<ApiResponse<PageResponse<RepairOrderResponse>>> getHistoryByVehicle(
            @PathVariable Long vehicleId,
            @PageableDefault(size = 20, sort = "createdDate") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(repairOrderService.getHistoryByVehicle(vehicleId, pageable))));
    }
}
