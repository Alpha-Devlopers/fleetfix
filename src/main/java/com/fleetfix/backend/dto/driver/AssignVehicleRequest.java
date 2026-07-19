package com.fleetfix.backend.dto.driver;

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
public class AssignVehicleRequest {

    @NotNull(message = "Vehicle id is required")
    private Long vehicleId;
}
