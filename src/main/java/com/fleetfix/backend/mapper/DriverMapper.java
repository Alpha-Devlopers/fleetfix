package com.fleetfix.backend.mapper;

import com.fleetfix.backend.dto.driver.DriverRequest;
import com.fleetfix.backend.dto.driver.DriverResponse;
import com.fleetfix.backend.entity.Driver;
import org.springframework.stereotype.Component;

@Component
public class DriverMapper {

    public Driver toEntity(DriverRequest request) {
        return Driver.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .licenseNumber(request.getLicenseNumber())
                .build();
    }

    public void updateEntity(Driver driver, DriverRequest request) {
        driver.setName(request.getName());
        driver.setPhone(request.getPhone());
        driver.setLicenseNumber(request.getLicenseNumber());
    }

    public DriverResponse toResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .name(driver.getName())
                .phone(driver.getPhone())
                .licenseNumber(driver.getLicenseNumber())
                .assignedVehicleId(driver.getAssignedVehicle() != null ? driver.getAssignedVehicle().getId() : null)
                .assignedVehicleRegistrationNumber(driver.getAssignedVehicle() != null ? driver.getAssignedVehicle().getRegistrationNumber() : null)
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }
}
