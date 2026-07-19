package com.fleetfix.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalVehicles;
    private long activeVehicles;
    private long vehiclesUnderMaintenance;
    private long totalDrivers;
    private long totalRepairOrders;
    private long pendingRepairs;
    private InventorySummary inventorySummary;
    private List<RecentDiagnosticEvent> recentDiagnosticEvents;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventorySummary {
        private long totalParts;
        private long totalUnitsInStock;
        private long lowStockPartsCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentDiagnosticEvent {
        private Long id;
        private Long vehicleId;
        private String dtcCode;
        private String severity;
        private String createdAt;
    }
}
