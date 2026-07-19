package com.fleetfix.backend.entity;

import jakarta.persistence.*;
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
@Entity
@Table(name = "maintenance_history")
public class MaintenanceHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "service_type", nullable = false, length = 80)
    private String serviceType;

    @Column(length = 500)
    private String remarks;
}
