package com.aegis.backend.entity;

import com.aegis.backend.enums.DisasterStatus;
import com.aegis.backend.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "disasters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Disaster {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 60)
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DisasterStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Priority priority;

    @Column(nullable = false)
    private Integer affectedPopulation;

    @Column(nullable = false, length = 200)
    private String location;

    private Double lat;

    private Double lng;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "disaster_required_resources", joinColumns = @JoinColumn(name = "disaster_id"))
    @Column(name = "resource_name")
    @Builder.Default
    private List<String> requiredResources = new ArrayList<>();

    @Column(nullable = false)
    private Instant startedAt;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
