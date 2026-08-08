package com.aegis.backend.entity;

import com.aegis.backend.enums.AllocationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resource_id", nullable = false)
    private DisasterResource resource;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "disaster_id", nullable = false)
    private Disaster disaster;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AllocationStatus status;

    @Column(nullable = false, length = 150)
    private String requestedBy;

    @Column(nullable = false)
    private Instant requestedAt;

    private Instant completedAt;
}
