package com.aegis.backend.entity;

import com.aegis.backend.enums.AlertStatus;
import com.aegis.backend.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AlertStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disaster_id")
    private Disaster disaster;

    @Column(nullable = false)
    private Instant createdAt;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;
}
