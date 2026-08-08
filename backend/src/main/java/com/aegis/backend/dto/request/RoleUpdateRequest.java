package com.aegis.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleUpdateRequest {
    @NotBlank(message = "Role is required")
    private String role;
}
