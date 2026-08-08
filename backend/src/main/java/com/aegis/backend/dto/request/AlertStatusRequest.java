package com.aegis.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AlertStatusRequest {
    @NotBlank(message = "Status is required")
    private String status;
}
