package com.aegis.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DisasterResponse {
    private String id;
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
