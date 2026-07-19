package com.fleetfix.backend.repository;

import com.fleetfix.backend.entity.DiagnosticEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiagnosticEventRepository extends JpaRepository<DiagnosticEvent, Long> {
    Page<DiagnosticEvent> findByVehicleId(Long vehicleId, Pageable pageable);
    long countByVehicleId(Long vehicleId);
    java.util.List<DiagnosticEvent> findTop10ByOrderByCreatedAtDesc();
}
