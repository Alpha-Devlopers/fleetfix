package com.fleetfix.backend.dto.maintenance;

import jakarta.validation.constraints.NotBlank;
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
public class MaintenanceHistoryRequest {

    @NotNull(message = "Service date is required")
    private LocalDate serviceDate;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private String remarks;
}
