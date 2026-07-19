package com.fleetfix.backend.repository;

import com.fleetfix.backend.entity.VehicleLocation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleLocationRepository extends JpaRepository<VehicleLocation, Long> {
    Optional<VehicleLocation> findTopByVehicleIdOrderByRecordedAtDesc(Long vehicleId);
    Page<VehicleLocation> findByVehicleIdOrderByRecordedAtDesc(Long vehicleId, Pageable pageable);
}
