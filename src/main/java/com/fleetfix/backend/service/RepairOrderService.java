package com.fleetfix.backend.service;

import com.fleetfix.backend.dto.repair.AssignMechanicRequest;
import com.fleetfix.backend.dto.repair.RepairOrderRequest;
import com.fleetfix.backend.dto.repair.RepairOrderResponse;
import com.fleetfix.backend.dto.repair.RepairStatusUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RepairOrderService {
    RepairOrderResponse createRepairOrder(RepairOrderRequest request);
    RepairOrderResponse updateStatus(Long id, RepairStatusUpdateRequest request);
    RepairOrderResponse assignMechanic(Long id, AssignMechanicRequest request);
    RepairOrderResponse getById(Long id);
    Page<RepairOrderResponse> getHistoryByVehicle(Long vehicleId, Pageable pageable);
}
