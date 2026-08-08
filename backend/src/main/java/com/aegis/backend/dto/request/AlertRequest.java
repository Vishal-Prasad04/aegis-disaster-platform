package com.aegis.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AlertRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Priority is required")
    private String priority;

    private String disasterId;

    private String description;
}
