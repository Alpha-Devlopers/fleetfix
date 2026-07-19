package com.fleetfix.backend.dto.report;

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
public class MaintenanceReportItem {
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private LocalDate serviceDate;
    private String serviceType;
    private String remarks;
}
