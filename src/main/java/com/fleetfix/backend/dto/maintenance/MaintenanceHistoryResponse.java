package com.fleetfix.backend.dto.maintenance;

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
public class MaintenanceHistoryResponse {
    private Long id;
    private Long vehicleId;
    private LocalDate serviceDate;
    private String serviceType;
    private String remarks;
}
