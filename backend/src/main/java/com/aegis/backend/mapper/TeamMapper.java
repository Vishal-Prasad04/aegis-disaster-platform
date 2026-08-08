package com.aegis.backend.mapper;

import com.aegis.backend.dto.response.TeamResponse;
import com.aegis.backend.entity.RescueTeam;
import org.springframework.stereotype.Component;

@Component
public class TeamMapper {
    public TeamResponse toResponse(RescueTeam t) {
        if (t == null) return null;
        return TeamResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .members(t.getMembers())
                .vehicle(t.getVehicle())
                .status(t.getStatus().getLabel())
                .assignment(t.getAssignment() != null ? t.getAssignment().getId() : null)
                .currentLocation(t.getCurrentLocation())
                .leader(t.getLeader())
                .build();
    }
}
