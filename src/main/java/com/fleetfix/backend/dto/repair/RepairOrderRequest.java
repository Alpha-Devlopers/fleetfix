package com.fleetfix.backend.dto.repair;

import jakarta.validation.constraints.NotNull;
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
public class RepairOrderRequest {

    @NotNull(message = "Vehicle id is required")
    private Long vehicleId;

    private Long diagnosticId;

    private Long assignedMechanic;

    private LocalDate estimatedCompletion;
}
