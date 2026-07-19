package com.fleetfix.backend.dto.tracking;

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
public class LocationResponse {
    private Long id;
    private Long vehicleId;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private LocalDateTime recordedAt;
}
