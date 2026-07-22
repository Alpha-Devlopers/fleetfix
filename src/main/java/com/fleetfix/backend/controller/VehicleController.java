package com.fleetfix.backend.controller;

import com.fleetfix.backend.dto.common.ApiResponse;
import com.fleetfix.backend.dto.common.PageResponse;
import com.fleetfix.backend.dto.maintenance.MaintenanceHistoryRequest;
import com.fleetfix.backend.dto.maintenance.MaintenanceHistoryResponse;
import com.fleetfix.backend.dto.vehicle.VehicleRequest;
import com.fleetfix.backend.dto.vehicle.VehicleResponse;
import com.fleetfix.backend.dto.vehicle.VehicleStatusUpdateRequest;
import com.fleetfix.backend.service.VehicleService;
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

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Tag(name = "Vehicles", description = "Vehicle management endpoints")
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    @Operation(summary = "Add a new vehicle")
    public ResponseEntity<ApiResponse<VehicleResponse>> addVehicle(@Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle added successfully", vehicleService.addVehicle(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    @Operation(summary = "Update an existing vehicle")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(@PathVariable Long id,
                                                                       @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", vehicleService.updateVehicle(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a vehicle")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully", null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle details by id")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getVehicleById(id)));
    }

    @GetMapping
    @Operation(summary = "List vehicles with pagination and sorting")
    public ResponseEntity<ApiResponse<PageResponse<VehicleResponse>>> listVehicles(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(vehicleService.listVehicles(pageable))));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','MECHANIC')")
    @Operation(summary = "Update vehicle status")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateStatus(@PathVariable Long id,
                                                                      @Valid @RequestBody VehicleStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Vehicle status updated", vehicleService.updateStatus(id, request)));
    }

    @GetMapping("/{id}/maintenance-history")
    @Operation(summary = "Get vehicle maintenance history")
    public ResponseEntity<ApiResponse<List<MaintenanceHistoryResponse>>> getMaintenanceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getMaintenanceHistory(id)));
    }

    @PostMapping("/{id}/maintenance-history")
    @PreAuthorize("hasAnyRole('ADMIN','MECHANIC')")
    @Operation(summary = "Add a maintenance history record for a vehicle")
    public ResponseEntity<ApiResponse<MaintenanceHistoryResponse>> addMaintenanceHistory(
            @PathVariable Long id, @Valid @RequestBody MaintenanceHistoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Maintenance history added", vehicleService.addMaintenanceHistory(id, request)));
    }
}
