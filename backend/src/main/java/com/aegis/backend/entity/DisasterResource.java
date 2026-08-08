package com.aegis.backend.entity;

import com.aegis.backend.enums.ResourceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Represents a physical/logistical resource item (renamed DisasterResource to avoid
 * clashing with java.util concepts / Spring's own "Resource" abstraction).
 */
@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisasterResource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 30)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ResourceStatus status;

    @Column(nullable = false, length = 150)
    private String warehouse;

    @Builder.Default
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}
