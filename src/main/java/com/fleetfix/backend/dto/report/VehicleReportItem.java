package com.fleetfix.backend.dto.report;

import com.fleetfix.backend.entity.VehicleStatus;
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
public class VehicleReportItem {
    private Long vehicleId;
    private String registrationNumber;
    private String manufacturer;
    private String model;
    private VehicleStatus status;
    private Double mileage;
    private long diagnosticEventCount;
    private long repairOrderCount;
}
