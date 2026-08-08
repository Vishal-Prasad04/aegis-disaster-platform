package com.aegis.backend.entity;

import com.aegis.backend.enums.TeamStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rescue_teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private Integer members;

    @Column(nullable = false, length = 100)
    private String vehicle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TeamStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_disaster_id")
    private Disaster assignment;

    @Column(length = 150)
    private String currentLocation;

    @Column(nullable = false, length = 150)
    private String leader;
}
