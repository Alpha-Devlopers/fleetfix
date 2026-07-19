package com.fleetfix.backend.controller;

import com.fleetfix.backend.dto.common.ApiResponse;
import com.fleetfix.backend.dto.dashboard.DashboardStatsResponse;
import com.fleetfix.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Aggregated fleet statistics for the dashboard screen")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStats()));
    }
}
