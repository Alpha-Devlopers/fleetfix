package com.fleetfix.backend.dto.vehicle;

import com.fleetfix.backend.entity.VehicleStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private VehicleStatus status;
}
