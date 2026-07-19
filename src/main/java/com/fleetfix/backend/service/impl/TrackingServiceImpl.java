package com.fleetfix.backend.service.impl;

import com.fleetfix.backend.dto.tracking.LocationResponse;
import com.fleetfix.backend.dto.tracking.LocationUpdateRequest;
import com.fleetfix.backend.entity.VehicleLocation;
import com.fleetfix.backend.exception.ResourceNotFoundException;
import com.fleetfix.backend.mapper.LocationMapper;
import com.fleetfix.backend.repository.VehicleLocationRepository;
import com.fleetfix.backend.repository.VehicleRepository;
import com.fleetfix.backend.service.TrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackingServiceImpl implements TrackingService {

    private final VehicleLocationRepository vehicleLocationRepository;
    private final VehicleRepository vehicleRepository;
    private final LocationMapper locationMapper;

    @Override
    @Transactional
    public LocationResponse saveLocation(LocationUpdateRequest request) {
        if (!vehicleRepository.existsById(request.getVehicleId())) {
            throw new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId());
        }
        VehicleLocation location = locationMapper.toEntity(request);
        VehicleLocation saved = vehicleLocationRepository.save(location);
        log.debug("Saved GPS coordinate for vehicle {}", request.getVehicleId());
        return locationMapper.toResponse(saved);
    }

    @Override
    public LocationResponse getCurrentLocation(Long vehicleId) {
        VehicleLocation location = vehicleLocationRepository.findTopByVehicleIdOrderByRecordedAtDesc(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("No location data found for vehicle id: " + vehicleId));
        return locationMapper.toResponse(location);
    }

    @Override
    public Page<LocationResponse> getRouteHistory(Long vehicleId, Pageable pageable) {
        return vehicleLocationRepository.findByVehicleIdOrderByRecordedAtDesc(vehicleId, pageable)
                .map(locationMapper::toResponse);
    }
}
