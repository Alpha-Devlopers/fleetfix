package com.fleetfix.backend.dto.driver;

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
public class DriverResponse {
    private Long id;
    private String name;
    private String phone;
    private String licenseNumber;
    private Long assignedVehicleId;
    private String assignedVehicleRegistrationNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
