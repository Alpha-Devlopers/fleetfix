package com.fleetfix.backend.repository;

import com.fleetfix.backend.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByLicenseNumber(String licenseNumber);
    boolean existsByLicenseNumber(String licenseNumber);
    Optional<Driver> findByAssignedVehicleId(Long vehicleId);
}
