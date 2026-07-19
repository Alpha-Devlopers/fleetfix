package com.fleetfix.backend.service.impl;

import com.fleetfix.backend.dto.inventory.InventoryRequest;
import com.fleetfix.backend.dto.inventory.InventoryResponse;
import com.fleetfix.backend.dto.inventory.ReservePartsRequest;
import com.fleetfix.backend.entity.Inventory;
import com.fleetfix.backend.exception.DuplicateResourceException;
import com.fleetfix.backend.exception.InsufficientInventoryException;
import com.fleetfix.backend.exception.ResourceNotFoundException;
import com.fleetfix.backend.mapper.InventoryMapper;
import com.fleetfix.backend.repository.InventoryRepository;
import com.fleetfix.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    @Transactional
    public InventoryResponse addPart(InventoryRequest request) {
        if (inventoryRepository.existsByPartNumber(request.getPartNumber())) {
            throw new DuplicateResourceException("Part already exists with part number: " + request.getPartNumber());
        }
        Inventory inventory = inventoryMapper.toEntity(request);
        Inventory saved = inventoryRepository.save(inventory);
        log.info("Added inventory part {}", saved.getPartNumber());
        return inventoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public InventoryResponse updatePart(Long id, InventoryRequest request) {
        Inventory inventory = getInventoryOrThrow(id);
        inventoryMapper.updateEntity(inventory, request);
        Inventory saved = inventoryRepository.save(inventory);
        log.info("Updated inventory part {}", id);
        return inventoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deletePart(Long id) {
        Inventory inventory = getInventoryOrThrow(id);
        inventoryRepository.delete(inventory);
        log.info("Deleted inventory part {}", id);
    }

    @Override
    public Page<InventoryResponse> listInventory(Pageable pageable) {
        return inventoryRepository.findAll(pageable).map(inventoryMapper::toResponse);
    }

    @Override
    @Transactional
    public InventoryResponse reserveParts(Long id, ReservePartsRequest request) {
        Inventory inventory = getInventoryOrThrow(id);
        int available = inventory.getQuantity() - inventory.getReservedQuantity();
        if (request.getQuantity() > available) {
            throw new InsufficientInventoryException(
                    "Cannot reserve " + request.getQuantity() + " units of " + inventory.getPartName()
                            + "; only " + available + " available");
        }
        inventory.setReservedQuantity(inventory.getReservedQuantity() + request.getQuantity());
        Inventory saved = inventoryRepository.save(inventory);
        log.info("Reserved {} units of part {}", request.getQuantity(), inventory.getPartNumber());
        return inventoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public InventoryResponse releaseReservedParts(Long id, ReservePartsRequest request) {
        Inventory inventory = getInventoryOrThrow(id);
        if (request.getQuantity() > inventory.getReservedQuantity()) {
            throw new InsufficientInventoryException(
                    "Cannot release " + request.getQuantity() + " units of " + inventory.getPartName()
                            + "; only " + inventory.getReservedQuantity() + " currently reserved");
        }
        inventory.setReservedQuantity(inventory.getReservedQuantity() - request.getQuantity());
        Inventory saved = inventoryRepository.save(inventory);
        log.info("Released {} reserved units of part {}", request.getQuantity(), inventory.getPartNumber());
        return inventoryMapper.toResponse(saved);
    }

    private Inventory getInventoryOrThrow(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory part not found with id: " + id));
    }
}
