package com.aegis.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShelterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Capacity is required")
    @PositiveOrZero
    private Integer capacity;

    @NotNull(message = "Occupancy is required")
    @PositiveOrZero
    private Integer occupancy;

    private String food;
    private String water;
    private String medical;
    private String disasterId;
}
