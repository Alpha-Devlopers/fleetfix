package com.fleetfix.backend.dto.vehicle;

import com.fleetfix.backend.entity.VehicleStatus;
import jakarta.validation.constraints.*;
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
public class VehicleRequest {

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Manufacturer is required")
    private String manufacturer;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    @Min(value = 1980, message = "Year must be 1980 or later")
    private Integer year;

    @NotNull(message = "Mileage is required")
    @PositiveOrZero(message = "Mileage cannot be negative")
    private Double mileage;

    @NotNull(message = "Status is required")
    private VehicleStatus status;
}
