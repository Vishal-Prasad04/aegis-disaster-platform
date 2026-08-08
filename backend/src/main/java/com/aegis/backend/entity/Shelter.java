package com.aegis.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shelters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shelter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer occupancy;

    @Column(nullable = false, length = 30)
    private String food;

    @Column(nullable = false, length = 30)
    private String water;

    @Column(nullable = false, length = 30)
    private String medical;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disaster_id")
    private Disaster disaster;
}
