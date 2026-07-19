package com.fleetfix.backend.mapper;

import com.fleetfix.backend.dto.vehicle.VehicleRequest;
import com.fleetfix.backend.dto.vehicle.VehicleResponse;
import com.fleetfix.backend.entity.Vehicle;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

    public Vehicle toEntity(VehicleRequest request) {
        return Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber())
                .manufacturer(request.getManufacturer())
                .model(request.getModel())
                .year(request.getYear())
                .mileage(request.getMileage())
                .status(request.getStatus())
                .build();
    }

    public void updateEntity(Vehicle vehicle, VehicleRequest request) {
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setManufacturer(request.getManufacturer());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setMileage(request.getMileage());
        vehicle.setStatus(request.getStatus());
    }

    public VehicleResponse toResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .registrationNumber(vehicle.getRegistrationNumber())
                .manufacturer(vehicle.getManufacturer())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .mileage(vehicle.getMileage())
                .status(vehicle.getStatus())
                .assignedDriverName(vehicle.getDriver() != null ? vehicle.getDriver().getName() : null)
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
