package com.fleetfix.backend.repository;

import com.fleetfix.backend.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByPartNumber(String partNumber);
    boolean existsByPartNumber(String partNumber);
}
