package com.fleetfix.backend.mapper;

import com.fleetfix.backend.dto.diagnostic.DiagnosticRequest;
import com.fleetfix.backend.dto.diagnostic.DiagnosticResponse;
import com.fleetfix.backend.entity.DiagnosticEvent;
import org.springframework.stereotype.Component;

@Component
public class DiagnosticMapper {

    public DiagnosticEvent toEntity(DiagnosticRequest request) {
        return DiagnosticEvent.builder()
                .vehicleId(request.getVehicleId())
                .dtcCode(request.getDtcCode())
                .description(request.getDescription())
                .severity(request.getSeverity())
                .build();
    }

    public DiagnosticResponse toResponse(DiagnosticEvent event, String registrationNumber) {
        return DiagnosticResponse.builder()
                .id(event.getId())
                .vehicleId(event.getVehicleId())
                .vehicleRegistrationNumber(registrationNumber)
                .dtcCode(event.getDtcCode())
                .description(event.getDescription())
                .severity(event.getSeverity())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
