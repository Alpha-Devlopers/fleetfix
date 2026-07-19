package com.fleetfix.backend.service.impl;

import com.fleetfix.backend.dto.repair.AssignMechanicRequest;
import com.fleetfix.backend.dto.repair.RepairOrderRequest;
import com.fleetfix.backend.dto.repair.RepairOrderResponse;
import com.fleetfix.backend.dto.repair.RepairStatusUpdateRequest;
import com.fleetfix.backend.entity.RepairOrder;
import com.fleetfix.backend.entity.RepairStatus;
import com.fleetfix.backend.entity.Role;
import com.fleetfix.backend.entity.User;
import com.fleetfix.backend.entity.Vehicle;
import com.fleetfix.backend.exception.BadRequestException;
import com.fleetfix.backend.exception.ResourceNotFoundException;
import com.fleetfix.backend.mapper.RepairOrderMapper;
import com.fleetfix.backend.repository.RepairOrderRepository;
import com.fleetfix.backend.repository.UserRepository;
import com.fleetfix.backend.repository.VehicleRepository;
import com.fleetfix.backend.service.RepairOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class RepairOrderServiceImpl implements RepairOrderService {

    private final RepairOrderRepository repairOrderRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final RepairOrderMapper repairOrderMapper;

    @Override
    @Transactional
    public RepairOrderResponse createRepairOrder(RepairOrderRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        if (request.getAssignedMechanic() != null) {
            validateMechanic(request.getAssignedMechanic());
        }

        RepairOrder order = repairOrderMapper.toEntity(request);
        order.setStatus(RepairStatus.OPEN);
        order.setCreatedDate(LocalDate.now());

        RepairOrder saved = repairOrderRepository.save(order);
        log.info("Created repair order {} for vehicle {}", saved.getId(), vehicle.getRegistrationNumber());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public RepairOrderResponse updateStatus(Long id, RepairStatusUpdateRequest request) {
        RepairOrder order = getOrderOrThrow(id);
        order.setStatus(request.getStatus());
        RepairOrder saved = repairOrderRepository.save(order);
        log.info("Updated repair order {} status to {}", id, request.getStatus());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public RepairOrderResponse assignMechanic(Long id, AssignMechanicRequest request) {
        RepairOrder order = getOrderOrThrow(id);
        validateMechanic(request.getMechanicId());
        order.setAssignedMechanic(request.getMechanicId());
        RepairOrder saved = repairOrderRepository.save(order);
        log.info("Assigned mechanic {} to repair order {}", request.getMechanicId(), id);
        return toResponse(saved);
    }

    @Override
    public RepairOrderResponse getById(Long id) {
        return toResponse(getOrderOrThrow(id));
    }

    @Override
    public Page<RepairOrderResponse> getHistoryByVehicle(Long vehicleId, Pageable pageable) {
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new ResourceNotFoundException("Vehicle not found with id: " + vehicleId);
        }
        return repairOrderRepository.findByVehicleId(vehicleId, pageable).map(this::toResponse);
    }

    private void validateMechanic(Long mechanicId) {
        User mechanic = userRepository.findById(mechanicId)
                .orElseThrow(() -> new ResourceNotFoundException("Mechanic (user) not found with id: " + mechanicId));
        if (mechanic.getRole() != Role.MECHANIC) {
            throw new BadRequestException("User with id " + mechanicId + " is not a mechanic");
        }
    }

    private RepairOrderResponse toResponse(RepairOrder order) {
        String registrationNumber = vehicleRepository.findById(order.getVehicleId())
                .map(Vehicle::getRegistrationNumber)
                .orElse(null);
        String mechanicName = order.getAssignedMechanic() != null
                ? userRepository.findById(order.getAssignedMechanic()).map(User::getUsername).orElse(null)
                : null;
        return repairOrderMapper.toResponse(order, registrationNumber, mechanicName);
    }

    private RepairOrder getOrderOrThrow(Long id) {
        return repairOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair order not found with id: " + id));
    }
}
