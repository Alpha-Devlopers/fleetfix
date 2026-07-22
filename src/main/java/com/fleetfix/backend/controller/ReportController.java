package com.fleetfix.backend.controller;

import com.fleetfix.backend.dto.common.ApiResponse;
import com.fleetfix.backend.dto.report.*;
import com.fleetfix.backend.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Reporting endpoints for vehicles, drivers, maintenance, inventory and repair orders")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/vehicles")
    @Operation(summary = "Vehicle report")
    public ResponseEntity<ApiResponse<List<VehicleReportItem>>> vehicleReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getVehicleReport()));
    }

    @GetMapping("/drivers")
    @Operation(summary = "Driver report")
    public ResponseEntity<ApiResponse<List<DriverReportItem>>> driverReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDriverReport()));
    }

    @GetMapping("/maintenance")
    @Operation(summary = "Maintenance report")
    public ResponseEntity<ApiResponse<List<MaintenanceReportItem>>> maintenanceReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getMaintenanceReport()));
    }

    @GetMapping("/inventory")
    @Operation(summary = "Inventory report")
    public ResponseEntity<ApiResponse<List<InventoryReportItem>>> inventoryReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getInventoryReport()));
    }

    @GetMapping("/repair-orders")
    @Operation(summary = "Repair order report")
    public ResponseEntity<ApiResponse<List<RepairOrderReportItem>>> repairOrderReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getRepairOrderReport()));
    }
}
