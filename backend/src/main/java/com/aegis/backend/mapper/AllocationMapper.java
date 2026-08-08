package com.aegis.backend.mapper;

import com.aegis.backend.dto.response.AllocationResponse;
import com.aegis.backend.entity.Allocation;
import org.springframework.stereotype.Component;

@Component
public class AllocationMapper {
    public AllocationResponse toResponse(Allocation a) {
        if (a == null) return null;
        return AllocationResponse.builder()
                .id(a.getId())
                .resourceId(a.getResource().getId())
                .resourceName(a.getResource().getName())
                .disasterId(a.getDisaster().getId())
                .disasterName(a.getDisaster().getName())
                .quantity(a.getQuantity())
                .status(a.getStatus().getLabel())
                .requestedBy(a.getRequestedBy())
                .requestedAt(a.getRequestedAt())
                .completedAt(a.getCompletedAt())
                .build();
    }
}
