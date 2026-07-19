package com.fleetfix.backend.service;

import com.fleetfix.backend.dto.vehicle.VehicleRequest;
import com.fleetfix.backend.dto.vehicle.VehicleResponse;
import com.fleetfix.backend.dto.vehicle.VehicleStatusUpdateRequest;
import com.fleetfix.backend.dto.maintenance.MaintenanceHistoryRequest;
import com.fleetfix.backend.dto.maintenance.MaintenanceHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface VehicleService {
    VehicleResponse addVehicle(VehicleRequest request);
    VehicleResponse updateVehicle(Long id, VehicleRequest request);
    void deleteVehicle(Long id);
    VehicleResponse getVehicleById(Long id);
    Page<VehicleResponse> listVehicles(Pageable pageable);
    VehicleResponse updateStatus(Long id, VehicleStatusUpdateRequest request);
    List<MaintenanceHistoryResponse> getMaintenanceHistory(Long vehicleId);
    MaintenanceHistoryResponse addMaintenanceHistory(Long vehicleId, MaintenanceHistoryRequest request);
}
