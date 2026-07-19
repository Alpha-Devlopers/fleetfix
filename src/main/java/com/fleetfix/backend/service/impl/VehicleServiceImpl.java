package com.fleetfix.backend.service.impl;

import com.fleetfix.backend.dto.maintenance.MaintenanceHistoryRequest;
import com.fleetfix.backend.dto.maintenance.MaintenanceHistoryResponse;
import com.fleetfix.backend.dto.vehicle.VehicleRequest;
import com.fleetfix.backend.dto.vehicle.VehicleResponse;
import com.fleetfix.backend.dto.vehicle.VehicleStatusUpdateRequest;
import com.fleetfix.backend.entity.MaintenanceHistory;
import com.fleetfix.backend.entity.Vehicle;
import com.fleetfix.backend.exception.DuplicateResourceException;
import com.fleetfix.backend.exception.ResourceNotFoundException;
import com.fleetfix.backend.mapper.MaintenanceHistoryMapper;
import com.fleetfix.backend.mapper.VehicleMapper;
import com.fleetfix.backend.repository.MaintenanceHistoryRepository;
import com.fleetfix.backend.repository.VehicleRepository;
import com.fleetfix.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final MaintenanceHistoryRepository maintenanceHistoryRepository;
    private final VehicleMapper vehicleMapper;
    private final MaintenanceHistoryMapper maintenanceHistoryMapper;

    @Override
    @Transactional
    public VehicleResponse addVehicle(VehicleRequest request) {
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateResourceException("Vehicle already exists with registration number: " + request.getRegistrationNumber());
        }
        Vehicle vehicle = vehicleMapper.toEntity(request);
        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Added vehicle {}", saved.getRegistrationNumber());
        return vehicleMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = getVehicleOrThrow(id);
        vehicleMapper.updateEntity(vehicle, request);
        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Updated vehicle {}", saved.getId());
        return vehicleMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleOrThrow(id);
        vehicleRepository.delete(vehicle);
        log.info("Deleted vehicle {}", id);
    }

    @Override
    public VehicleResponse getVehicleById(Long id) {
        return vehicleMapper.toResponse(getVehicleOrThrow(id));
    }

    @Override
    public Page<VehicleResponse> listVehicles(Pageable pageable) {
        return vehicleRepository.findAll(pageable).map(vehicleMapper::toResponse);
    }

    @Override
    @Transactional
    public VehicleResponse updateStatus(Long id, VehicleStatusUpdateRequest request) {
        Vehicle vehicle = getVehicleOrThrow(id);
        vehicle.setStatus(request.getStatus());
        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Updated status of vehicle {} to {}", id, request.getStatus());
        return vehicleMapper.toResponse(saved);
    }

    @Override
    public List<MaintenanceHistoryResponse> getMaintenanceHistory(Long vehicleId) {
        getVehicleOrThrow(vehicleId);
        return maintenanceHistoryRepository.findByVehicleIdOrderByServiceDateDesc(vehicleId).stream()
                .map(maintenanceHistoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public MaintenanceHistoryResponse addMaintenanceHistory(Long vehicleId, MaintenanceHistoryRequest request) {
        getVehicleOrThrow(vehicleId);
        MaintenanceHistory history = maintenanceHistoryMapper.toEntity(vehicleId, request);
        MaintenanceHistory saved = maintenanceHistoryRepository.save(history);
        log.info("Added maintenance history for vehicle {}", vehicleId);
        return maintenanceHistoryMapper.toResponse(saved);
    }

    private Vehicle getVehicleOrThrow(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }
}
