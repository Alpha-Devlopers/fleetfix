package com.fleetfix.backend.entity;

import jakarta.persistence.*;
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
@Entity
@Table(name = "vehicles", uniqueConstraints = {
        @UniqueConstraint(columnNames = "registration_number")
})
public class Vehicle extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", nullable = false, length = 30)
    private String registrationNumber;

    @Column(nullable = false, length = 60)
    private String manufacturer;

    @Column(nullable = false, length = 60)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Double mileage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VehicleStatus status;

    @OneToOne(mappedBy = "assignedVehicle", fetch = FetchType.LAZY)
    private Driver driver;
}
