package com.fleetfix.backend.dto.report;

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
public class DriverReportItem {
    private Long driverId;
    private String name;
    private String licenseNumber;
    private String assignedVehicleRegistrationNumber;
}
