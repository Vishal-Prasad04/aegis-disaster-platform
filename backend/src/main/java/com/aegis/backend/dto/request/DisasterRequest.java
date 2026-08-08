package com.aegis.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class DisasterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;

    private String status;

    private String priority;

    @NotNull(message = "Affected population is required")
    @PositiveOrZero(message = "Affected population cannot be negative")
    private Integer affectedPopulation;

    @NotBlank(message = "Location is required")
    private String location;

    private Double lat;

    private Double lng;

    private List<String> requiredResources;

    private Instant startedAt;

    private String description;
}
