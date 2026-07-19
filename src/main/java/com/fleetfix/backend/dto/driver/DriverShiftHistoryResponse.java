package com.fleetfix.backend.dto.driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Represents a single vehicle-assignment period for a driver, derived
 * from audit timestamps since assignment history is tracked at the
 * driver/vehicle relationship level for this college project scope.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverShiftHistoryResponse {
    private Long driverId;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private LocalDateTime assignedAt;
}
