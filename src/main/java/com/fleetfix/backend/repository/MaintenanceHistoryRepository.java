package com.fleetfix.backend.repository;

import com.fleetfix.backend.entity.MaintenanceHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceHistoryRepository extends JpaRepository<MaintenanceHistory, Long> {
    Page<MaintenanceHistory> findByVehicleId(Long vehicleId, Pageable pageable);
    java.util.List<MaintenanceHistory> findByVehicleIdOrderByServiceDateDesc(Long vehicleId);
}
