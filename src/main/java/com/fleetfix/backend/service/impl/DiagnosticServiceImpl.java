package com.fleetfix.backend.service.impl;

import com.fleetfix.backend.dto.diagnostic.DiagnosticRequest;
import com.fleetfix.backend.dto.diagnostic.DiagnosticResponse;
import com.fleetfix.backend.entity.DiagnosticEvent;
import com.fleetfix.backend.entity.Vehicle;
import com.fleetfix.backend.exception.ResourceNotFoundException;
import com.fleetfix.backend.mapper.DiagnosticMapper;
import com.fleetfix.backend.repository.DiagnosticEventRepository;
import com.fleetfix.backend.repository.VehicleRepository;
import com.fleetfix.backend.service.DiagnosticService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiagnosticServiceImpl implements DiagnosticService {

    private final DiagnosticEventRepository diagnosticEventRepository;
    private final VehicleRepository vehicleRepository;
    private final DiagnosticMapper diagnosticMapper;

    @Override
    @Transactional
    public DiagnosticResponse createDiagnostic(DiagnosticRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        DiagnosticEvent event = diagnosticMapper.toEntity(request);
        DiagnosticEvent saved = diagnosticEventRepository.save(event);
        log.info("Recorded DTC {} for vehicle {}", saved.getDtcCode(), vehicle.getRegistrationNumber());
        return diagnosticMapper.toResponse(saved, vehicle.getRegistrationNumber());
    }

    @Override
    public DiagnosticResponse getById(Long id) {
        DiagnosticEvent event = diagnosticEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnostic event not found with id: " + id));
        String registrationNumber = vehicleRepository.findById(event.getVehicleId())
                .map(Vehicle::getRegistrationNumber)
                .orElse(null);
        return diagnosticMapper.toResponse(event, registrationNumber);
    }

    @Override
    public Page<DiagnosticResponse> getHistoryByVehicle(Long vehicleId, Pageable pageable) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));
        return diagnosticEventRepository.findByVehicleId(vehicleId, pageable)
                .map(event -> diagnosticMapper.toResponse(event, vehicle.getRegistrationNumber()));
    }
}
