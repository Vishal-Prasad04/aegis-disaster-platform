package com.aegis.backend.mapper;

import com.aegis.backend.dto.response.AlertResponse;
import com.aegis.backend.entity.Alert;
import org.springframework.stereotype.Component;

@Component
public class AlertMapper {
    public AlertResponse toResponse(Alert a) {
        if (a == null) return null;
        return AlertResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .priority(a.getPriority().getLabel())
                .status(a.getStatus().getLabel())
                .disasterId(a.getDisaster() != null ? a.getDisaster().getId() : null)
                .createdAt(a.getCreatedAt())
                .description(a.getDescription())
                .build();
    }
}
