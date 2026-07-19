package com.fleetfix.backend.service.impl;

import com.fleetfix.backend.dto.driver.AssignVehicleRequest;
import com.fleetfix.backend.dto.driver.DriverRequest;
import com.fleetfix.backend.dto.driver.DriverResponse;
import com.fleetfix.backend.dto.driver.DriverShiftHistoryResponse;
import com.fleetfix.backend.entity.Driver;
import com.fleetfix.backend.entity.Vehicle;
import com.fleetfix.backend.exception.BadRequestException;
import com.fleetfix.backend.exception.DuplicateResourceException;
import com.fleetfix.backend.exception.ResourceNotFoundException;
import com.fleetfix.backend.mapper.DriverMapper;
import com.fleetfix.backend.repository.DriverRepository;
import com.fleetfix.backend.repository.VehicleRepository;
import com.fleetfix.backend.service.DriverService;
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
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverMapper driverMapper;

    @Override
    @Transactional
    public DriverResponse addDriver(DriverRequest request) {
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("Driver already exists with license number: " + request.getLicenseNumber());
        }
        Driver driver = driverMapper.toEntity(request);
        Driver saved = driverRepository.save(driver);
        log.info("Added driver {}", saved.getName());
        return driverMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = getDriverOrThrow(id);
        driverMapper.updateEntity(driver, request);
        Driver saved = driverRepository.save(driver);
        log.info("Updated driver {}", id);
        return driverMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDriver(Long id) {
        Driver driver = getDriverOrThrow(id);
        driverRepository.delete(driver);
        log.info("Deleted driver {}", id);
    }

    @Override
    public DriverResponse getDriverById(Long id) {
        return driverMapper.toResponse(getDriverOrThrow(id));
    }

    @Override
    public Page<DriverResponse> listDrivers(Pageable pageable) {
        return driverRepository.findAll(pageable).map(driverMapper::toResponse);
    }

    @Override
    @Transactional
    public DriverResponse assignVehicle(Long driverId, AssignVehicleRequest request) {
        Driver driver = getDriverOrThrow(driverId);
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        driverRepository.findByAssignedVehicleId(vehicle.getId()).ifPresent(existing -> {
            if (!existing.getId().equals(driverId)) {
                throw new BadRequestException("Vehicle is already assigned to another driver: " + existing.getName());
            }
        });

        driver.setAssignedVehicle(vehicle);
        Driver saved = driverRepository.save(driver);
        log.info("Assigned vehicle {} to driver {}", vehicle.getRegistrationNumber(), driverId);
        return driverMapper.toResponse(saved);
    }

    @Override
    public List<DriverShiftHistoryResponse> getShiftHistory(Long driverId) {
        Driver driver = getDriverOrThrow(driverId);
        if (driver.getAssignedVehicle() == null) {
            return List.of();
        }
        return List.of(DriverShiftHistoryResponse.builder()
                .driverId(driver.getId())
                .vehicleId(driver.getAssignedVehicle().getId())
                .vehicleRegistrationNumber(driver.getAssignedVehicle().getRegistrationNumber())
                .assignedAt(driver.getUpdatedAt())
                .build());
    }

    private Driver getDriverOrThrow(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
    }
}
