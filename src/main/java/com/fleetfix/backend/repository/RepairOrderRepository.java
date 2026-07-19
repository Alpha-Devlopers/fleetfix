package com.fleetfix.backend.repository;

import com.fleetfix.backend.entity.RepairOrder;
import com.fleetfix.backend.entity.RepairStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepairOrderRepository extends JpaRepository<RepairOrder, Long> {
    Page<RepairOrder> findByVehicleId(Long vehicleId, Pageable pageable);
    long countByStatusIn(java.util.List<RepairStatus> statuses);
    long countByVehicleId(Long vehicleId);
}
