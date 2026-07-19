package com.fleetfix.backend.controller;

import com.fleetfix.backend.dto.common.ApiResponse;
import com.fleetfix.backend.dto.common.PageResponse;
import com.fleetfix.backend.dto.tracking.LocationResponse;
import com.fleetfix.backend.dto.tracking.LocationUpdateRequest;
import com.fleetfix.backend.service.TrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
@Tag(name = "Tracking", description = "Vehicle GPS tracking endpoints")
public class TrackingController {

    private final TrackingService trackingService;

    @PostMapping("/location")
    @Operation(summary = "Save a vehicle GPS coordinate")
    public ResponseEntity<ApiResponse<LocationResponse>> saveLocation(@Valid @RequestBody LocationUpdateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Location saved", trackingService.saveLocation(request)));
    }

    @GetMapping("/{vehicleId}/current")
    @Operation(summary = "Get the current location of a vehicle")
    public ResponseEntity<ApiResponse<LocationResponse>> getCurrentLocation(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(ApiResponse.success(trackingService.getCurrentLocation(vehicleId)));
    }

    @GetMapping("/{vehicleId}/route-history")
    @Operation(summary = "Get the route history for a vehicle")
    public ResponseEntity<ApiResponse<PageResponse<LocationResponse>>> getRouteHistory(
            @PathVariable Long vehicleId,
            @PageableDefault(size = 50, sort = "recordedAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(trackingService.getRouteHistory(vehicleId, pageable))));
    }
}
