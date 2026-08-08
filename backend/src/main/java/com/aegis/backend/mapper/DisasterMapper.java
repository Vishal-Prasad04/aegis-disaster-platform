package com.aegis.backend.mapper;

import com.aegis.backend.dto.response.DisasterResponse;
import com.aegis.backend.entity.Disaster;
import org.springframework.stereotype.Component;

@Component
public class DisasterMapper {
    public DisasterResponse toResponse(Disaster d) {
        if (d == null) return null;
        return DisasterResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .type(d.getType())
                .status(d.getStatus().getLabel())
                .priority(d.getPriority().getLabel())
                .affectedPopulation(d.getAffectedPopulation())
                .location(d.getLocation())
                .lat(d.getLat())
                .lng(d.getLng())
                .requiredResources(d.getRequiredResources())
                .startedAt(d.getStartedAt())
                .description(d.getDescription())
                .build();
    }
}
