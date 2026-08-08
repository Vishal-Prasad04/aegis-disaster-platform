package com.aegis.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResourceRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity cannot be negative")
    private Integer quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    private String status;

    @NotBlank(message = "Warehouse is required")
    private String warehouse;
}
