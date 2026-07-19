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
@Table(name = "repair_orders")
public class RepairOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(name = "diagnostic_id")
    private Long diagnosticId;

    @Column(name = "assigned_mechanic")
    private Long assignedMechanic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RepairStatus status;

    @Column(name = "estimated_completion")
    private LocalDate estimatedCompletion;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;
}
