package com.fleetfix.backend.controller;

import com.fleetfix.backend.dto.common.ApiResponse;
import com.fleetfix.backend.dto.common.PageResponse;
import com.fleetfix.backend.dto.driver.AssignVehicleRequest;
import com.fleetfix.backend.dto.driver.DriverRequest;
import com.fleetfix.backend.dto.driver.DriverResponse;
import com.fleetfix.backend.dto.driver.DriverShiftHistoryResponse;
import com.fleetfix.backend.service.DriverService;
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
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Tag(name = "Drivers", description = "Driver management endpoints")
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    @Operation(summary = "Add a new driver")
    public ResponseEntity<ApiResponse<DriverResponse>> addDriver(@Valid @RequestBody DriverRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Driver added successfully", driverService.addDriver(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    @Operation(summary = "Update an existing driver")
    public ResponseEntity<ApiResponse<DriverResponse>> updateDriver(@PathVariable Long id,
                                                                     @Valid @RequestBody DriverRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Driver updated successfully", driverService.updateDriver(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a driver")
    public ResponseEntity<ApiResponse<Void>> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(ApiResponse.success("Driver deleted successfully", null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get driver details by id")
    public ResponseEntity<ApiResponse<DriverResponse>> getDriver(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(driverService.getDriverById(id)));
    }

    @GetMapping
    @Operation(summary = "List drivers with pagination and sorting")
    public ResponseEntity<ApiResponse<PageResponse<DriverResponse>>> listDrivers(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(driverService.listDrivers(pageable))));
    }

    @PostMapping("/{id}/assign-vehicle")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    @Operation(summary = "Assign a vehicle to a driver")
    public ResponseEntity<ApiResponse<DriverResponse>> assignVehicle(@PathVariable Long id,
                                                                      @Valid @RequestBody AssignVehicleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Vehicle assigned successfully", driverService.assignVehicle(id, request)));
    }

    @GetMapping("/{id}/shift-history")
    @Operation(summary = "Get driver shift/assignment history")
    public ResponseEntity<ApiResponse<List<DriverShiftHistoryResponse>>> getShiftHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(driverService.getShiftHistory(id)));
    }
}
