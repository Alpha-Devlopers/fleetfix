package com.fleetfix.backend.mapper;

import com.fleetfix.backend.dto.maintenance.MaintenanceHistoryRequest;
import com.fleetfix.backend.dto.maintenance.MaintenanceHistoryResponse;
import com.fleetfix.backend.entity.MaintenanceHistory;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceHistoryMapper {

    public MaintenanceHistory toEntity(Long vehicleId, MaintenanceHistoryRequest request) {
        return MaintenanceHistory.builder()
                .vehicleId(vehicleId)
                .serviceDate(request.getServiceDate())
                .serviceType(request.getServiceType())
                .remarks(request.getRemarks())
                .build();
    }

    public MaintenanceHistoryResponse toResponse(MaintenanceHistory history) {
        return MaintenanceHistoryResponse.builder()
                .id(history.getId())
                .vehicleId(history.getVehicleId())
                .serviceDate(history.getServiceDate())
                .serviceType(history.getServiceType())
                .remarks(history.getRemarks())
                .build();
    }
}
