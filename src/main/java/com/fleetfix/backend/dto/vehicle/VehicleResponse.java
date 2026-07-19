package com.fleetfix.backend.dto.vehicle;

import com.fleetfix.backend.entity.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private String registrationNumber;
    private String manufacturer;
    private String model;
    private Integer year;
    private Double mileage;
    private VehicleStatus status;
    private String assignedDriverName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
