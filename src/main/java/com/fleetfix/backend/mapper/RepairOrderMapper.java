package com.fleetfix.backend.mapper;

import com.fleetfix.backend.dto.repair.RepairOrderRequest;
import com.fleetfix.backend.dto.repair.RepairOrderResponse;
import com.fleetfix.backend.entity.RepairOrder;
import org.springframework.stereotype.Component;

@Component
public class RepairOrderMapper {

    public RepairOrder toEntity(RepairOrderRequest request) {
        return RepairOrder.builder()
                .vehicleId(request.getVehicleId())
                .diagnosticId(request.getDiagnosticId())
                .assignedMechanic(request.getAssignedMechanic())
                .estimatedCompletion(request.getEstimatedCompletion())
                .build();
    }

    public RepairOrderResponse toResponse(RepairOrder order, String registrationNumber, String mechanicName) {
        return RepairOrderResponse.builder()
                .id(order.getId())
                .vehicleId(order.getVehicleId())
                .vehicleRegistrationNumber(registrationNumber)
                .diagnosticId(order.getDiagnosticId())
                .assignedMechanic(order.getAssignedMechanic())
                .assignedMechanicName(mechanicName)
                .status(order.getStatus())
                .estimatedCompletion(order.getEstimatedCompletion())
                .createdDate(order.getCreatedDate())
                .build();
    }
}
