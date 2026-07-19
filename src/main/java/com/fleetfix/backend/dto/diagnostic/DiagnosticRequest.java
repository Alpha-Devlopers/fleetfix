package com.fleetfix.backend.dto.diagnostic;

import com.fleetfix.backend.entity.Severity;
import jakarta.validation.constraints.NotBlank;
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
public class DiagnosticRequest {

    @NotNull(message = "Vehicle id is required")
    private Long vehicleId;

    @NotBlank(message = "DTC code is required")
    private String dtcCode;

    private String description;

    @NotNull(message = "Severity is required")
    private Severity severity;
}
