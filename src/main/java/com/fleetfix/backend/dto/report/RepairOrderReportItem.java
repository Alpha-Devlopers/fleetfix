package com.fleetfix.backend.dto.report;

import com.fleetfix.backend.entity.RepairStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepairOrderReportItem {
    private Long repairOrderId;
    private String vehicleRegistrationNumber;
    private RepairStatus status;
    private LocalDate createdDate;
    private LocalDate estimatedCompletion;
}
