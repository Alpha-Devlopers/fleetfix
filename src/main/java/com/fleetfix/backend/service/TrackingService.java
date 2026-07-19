package com.fleetfix.backend.service;

import com.fleetfix.backend.dto.tracking.LocationResponse;
import com.fleetfix.backend.dto.tracking.LocationUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TrackingService {
    LocationResponse saveLocation(LocationUpdateRequest request);
    LocationResponse getCurrentLocation(Long vehicleId);
    Page<LocationResponse> getRouteHistory(Long vehicleId, Pageable pageable);
}
