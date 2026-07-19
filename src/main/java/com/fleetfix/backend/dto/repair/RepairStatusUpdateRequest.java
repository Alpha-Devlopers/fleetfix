package com.fleetfix.backend.dto.repair;

import com.fleetfix.backend.entity.RepairStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepairStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private RepairStatus status;
}
