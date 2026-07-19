package com.fleetfix.backend.repository;

import com.fleetfix.backend.entity.Vehicle;
import com.fleetfix.backend.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumber(String registrationNumber);
    long countByStatus(VehicleStatus status);
}
