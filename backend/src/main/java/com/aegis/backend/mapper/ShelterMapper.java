package com.aegis.backend.mapper;

import com.aegis.backend.dto.response.ShelterResponse;
import com.aegis.backend.entity.Shelter;
import org.springframework.stereotype.Component;

@Component
public class ShelterMapper {
    public ShelterResponse toResponse(Shelter s) {
        if (s == null) return null;
        return ShelterResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .location(s.getLocation())
                .capacity(s.getCapacity())
                .occupancy(s.getOccupancy())
                .food(s.getFood())
                .water(s.getWater())
                .medical(s.getMedical())
                .disasterId(s.getDisaster() != null ? s.getDisaster().getId() : null)
                .build();
    }
}
