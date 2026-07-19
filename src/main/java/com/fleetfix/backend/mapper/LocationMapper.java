package com.fleetfix.backend.mapper;

import com.fleetfix.backend.dto.tracking.LocationResponse;
import com.fleetfix.backend.dto.tracking.LocationUpdateRequest;
import com.fleetfix.backend.entity.VehicleLocation;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class LocationMapper {

    public VehicleLocation toEntity(LocationUpdateRequest request) {
        return VehicleLocation.builder()
                .vehicleId(request.getVehicleId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .speed(request.getSpeed())
                .heading(request.getHeading())
                .recordedAt(LocalDateTime.now())
                .build();
    }

    public LocationResponse toResponse(VehicleLocation location) {
        return LocationResponse.builder()
                .id(location.getId())
                .vehicleId(location.getVehicleId())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .speed(location.getSpeed())
                .heading(location.getHeading())
                .recordedAt(location.getRecordedAt())
                .build();
    }
}
