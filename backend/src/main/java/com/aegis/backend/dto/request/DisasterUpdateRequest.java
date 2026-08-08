package com.aegis.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

/** Partial update - all fields optional, matching frontend's Partial<Disaster> PUT body. */
@Getter
@Setter
public class DisasterUpdateRequest {
    private String name;
    private String type;
    private String status;
    private String priority;
    private Integer affectedPopulation;
    private String location;
    private Double lat;
    private Double lng;
    private List<String> requiredResources;
    private Instant startedAt;
    private String description;
}
