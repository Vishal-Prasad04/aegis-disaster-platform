package com.aegis.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Members is required")
    @Positive(message = "Members must be greater than zero")
    private Integer members;

    @NotBlank(message = "Vehicle is required")
    private String vehicle;

    private String status;

    private String assignment;

    private String currentLocation;

    @NotBlank(message = "Leader is required")
    private String leader;
}
