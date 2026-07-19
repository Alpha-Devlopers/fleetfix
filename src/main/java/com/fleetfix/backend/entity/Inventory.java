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
@Table(name = "inventory", uniqueConstraints = {
        @UniqueConstraint(columnNames = "part_number")
})
public class Inventory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "part_number", nullable = false, length = 40)
    private String partNumber;

    @Column(name = "part_name", nullable = false, length = 120)
    private String partName;

    @Column(nullable = false)
    private Integer quantity;

    @Builder.Default
    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

    @Column(name = "warehouse_location", length = 60)
    private String warehouseLocation;
}
