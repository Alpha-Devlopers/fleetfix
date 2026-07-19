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
@Table(name = "drivers", uniqueConstraints = {
        @UniqueConstraint(columnNames = "license_number")
})
public class Driver extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(name = "license_number", nullable = false, length = 40)
    private String licenseNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_vehicle_id")
    private Vehicle assignedVehicle;
}
