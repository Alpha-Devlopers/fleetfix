package com.fleetfix.backend.service.impl;

import com.fleetfix.backend.dto.report.*;
import com.fleetfix.backend.entity.Driver;
import com.fleetfix.backend.entity.Vehicle;
import com.fleetfix.backend.repository.*;
import com.fleetfix.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final MaintenanceHistoryRepository maintenanceHistoryRepository;
    private final InventoryRepository inventoryRepository;
    private final RepairOrderRepository repairOrderRepository;
    private final DiagnosticEventRepository diagnosticEventRepository;

    @Override
    public List<VehicleReportItem> getVehicleReport() {
        return vehicleRepository.findAll().stream()
                .map(v -> VehicleReportItem.builder()
                        .vehicleId(v.getId())
                        .registrationNumber(v.getRegistrationNumber())
                        .manufacturer(v.getManufacturer())
                        .model(v.getModel())
                        .status(v.getStatus())
                        .mileage(v.getMileage())
                        .diagnosticEventCount(diagnosticEventRepository.countByVehicleId(v.getId()))
                        .repairOrderCount(repairOrderRepository.countByVehicleId(v.getId()))
                        .build())
                .toList();
    }

    @Override
    public List<DriverReportItem> getDriverReport() {
        return driverRepository.findAll().stream()
                .map(this::toDriverReportItem)
                .toList();
    }

    private DriverReportItem toDriverReportItem(Driver driver) {
        Vehicle vehicle = driver.getAssignedVehicle();
        return DriverReportItem.builder()
                .driverId(driver.getId())
                .name(driver.getName())
                .licenseNumber(driver.getLicenseNumber())
                .assignedVehicleRegistrationNumber(vehicle != null ? vehicle.getRegistrationNumber() : null)
                .build();
    }

    @Override
    public List<MaintenanceReportItem> getMaintenanceReport() {
        return maintenanceHistoryRepository.findAll().stream()
                .map(m -> MaintenanceReportItem.builder()
                        .vehicleId(m.getVehicleId())
                        .vehicleRegistrationNumber(vehicleRepository.findById(m.getVehicleId())
                                .map(Vehicle::getRegistrationNumber).orElse(null))
                        .serviceDate(m.getServiceDate())
                        .serviceType(m.getServiceType())
                        .remarks(m.getRemarks())
                        .build())
                .toList();
    }

    @Override
    public List<InventoryReportItem> getInventoryReport() {
        return inventoryRepository.findAll().stream()
                .map(i -> InventoryReportItem.builder()
                        .partNumber(i.getPartNumber())
                        .partName(i.getPartName())
                        .quantity(i.getQuantity())
                        .reservedQuantity(i.getReservedQuantity())
                        .availableQuantity(i.getQuantity() - i.getReservedQuantity())
                        .warehouseLocation(i.getWarehouseLocation())
                        .build())
                .toList();
    }

    @Override
    public List<RepairOrderReportItem> getRepairOrderReport() {
        return repairOrderRepository.findAll().stream()
                .map(r -> RepairOrderReportItem.builder()
                        .repairOrderId(r.getId())
                        .vehicleRegistrationNumber(vehicleRepository.findById(r.getVehicleId())
                                .map(Vehicle::getRegistrationNumber).orElse(null))
                        .status(r.getStatus())
                        .createdDate(r.getCreatedDate())
                        .estimatedCompletion(r.getEstimatedCompletion())
                        .build())
                .toList();
    }
}
