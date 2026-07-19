package com.fleetfix.backend.service;

import com.fleetfix.backend.dto.diagnostic.DiagnosticRequest;
import com.fleetfix.backend.dto.diagnostic.DiagnosticResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DiagnosticService {
    DiagnosticResponse createDiagnostic(DiagnosticRequest request);
    DiagnosticResponse getById(Long id);
    Page<DiagnosticResponse> getHistoryByVehicle(Long vehicleId, Pageable pageable);
}
