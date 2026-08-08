package com.aegis.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignResourceRequest {
    @NotBlank(message = "resourceId is required")
    private String resourceId;

    @NotBlank(message = "disasterId is required")
    private String disasterId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;

    @NotBlank(message = "requestedBy is required")
    private String requestedBy;
}
