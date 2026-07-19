package com.fleetfix.backend.dto.diagnostic;

import com.fleetfix.backend.entity.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosticResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private String dtcCode;
    private String description;
    private Severity severity;
    private LocalDateTime createdAt;
}
