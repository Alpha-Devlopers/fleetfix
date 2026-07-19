package com.fleetfix.backend.service.impl;

import com.fleetfix.backend.dto.dashboard.DashboardStatsResponse;
import com.fleetfix.backend.entity.DiagnosticEvent;
import com.fleetfix.backend.entity.RepairStatus;
import com.fleetfix.backend.entity.VehicleStatus;
import com.fleetfix.backend.repository.*;
import com.fleetfix.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final int LOW_STOCK_THRESHOLD = 5;
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final RepairOrderRepository repairOrderRepository;
    private final InventoryRepository inventoryRepository;
    private final DiagnosticEventRepository diagnosticEventRepository;

    @Override
    public DashboardStatsResponse getStats() {
        long totalVehicles = vehicleRepository.count();
        long activeVehicles = vehicleRepository.countByStatus(VehicleStatus.ACTIVE);
        long vehiclesUnderMaintenance = vehicleRepository.countByStatus(VehicleStatus.UNDER_MAINTENANCE);
        long totalDrivers = driverRepository.count();
        long totalRepairOrders = repairOrderRepository.count();
        long pendingRepairs = repairOrderRepository.countByStatusIn(List.of(RepairStatus.OPEN, RepairStatus.IN_PROGRESS));

        long totalParts = inventoryRepository.count();
        long totalUnitsInStock = inventoryRepository.findAll().stream()
                .mapToLong(i -> i.getQuantity() == null ? 0 : i.getQuantity())
                .sum();
        long lowStockParts = inventoryRepository.findAll().stream()
                .filter(i -> (i.getQuantity() - i.getReservedQuantity()) <= LOW_STOCK_THRESHOLD)
                .count();

        List<DashboardStatsResponse.RecentDiagnosticEvent> recentEvents = diagnosticEventRepository
                .findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::toRecentEvent)
                .toList();

        return DashboardStatsResponse.builder()
                .totalVehicles(totalVehicles)
                .activeVehicles(activeVehicles)
                .vehiclesUnderMaintenance(vehiclesUnderMaintenance)
                .totalDrivers(totalDrivers)
                .totalRepairOrders(totalRepairOrders)
                .pendingRepairs(pendingRepairs)
                .inventorySummary(DashboardStatsResponse.InventorySummary.builder()
                        .totalParts(totalParts)
                        .totalUnitsInStock(totalUnitsInStock)
                        .lowStockPartsCount(lowStockParts)
                        .build())
                .recentDiagnosticEvents(recentEvents)
                .build();
    }

    private DashboardStatsResponse.RecentDiagnosticEvent toRecentEvent(DiagnosticEvent event) {
        return DashboardStatsResponse.RecentDiagnosticEvent.builder()
                .id(event.getId())
                .vehicleId(event.getVehicleId())
                .dtcCode(event.getDtcCode())
                .severity(event.getSeverity().name())
                .createdAt(event.getCreatedAt() != null ? event.getCreatedAt().format(TIMESTAMP_FORMAT) : null)
                .build();
    }
}
