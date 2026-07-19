package com.fleetfix.backend.dto.repair;

import com.fleetfix.backend.entity.RepairStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepairOrderResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private Long diagnosticId;
    private Long assignedMechanic;
    private String assignedMechanicName;
    private RepairStatus status;
    private LocalDate estimatedCompletion;
    private LocalDate createdDate;
}
