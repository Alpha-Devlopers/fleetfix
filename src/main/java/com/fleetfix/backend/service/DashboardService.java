package com.fleetfix.backend.service;

import com.fleetfix.backend.dto.dashboard.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse getStats();
}
