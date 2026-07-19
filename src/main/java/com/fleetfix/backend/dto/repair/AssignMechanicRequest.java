package com.fleetfix.backend.dto.repair;

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
public class AssignMechanicRequest {

    @NotNull(message = "Mechanic (user) id is required")
    private Long mechanicId;
}
