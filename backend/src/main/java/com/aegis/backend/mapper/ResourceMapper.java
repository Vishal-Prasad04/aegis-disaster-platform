package com.aegis.backend.mapper;

import com.aegis.backend.dto.response.ResourceResponse;
import com.aegis.backend.entity.DisasterResource;
import org.springframework.stereotype.Component;

@Component
public class ResourceMapper {
    public ResourceResponse toResponse(DisasterResource r) {
        if (r == null) return null;
        return ResourceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .category(r.getCategory())
                .quantity(r.getQuantity())
                .unit(r.getUnit())
                .status(r.getStatus().getLabel())
                .warehouse(r.getWarehouse())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
