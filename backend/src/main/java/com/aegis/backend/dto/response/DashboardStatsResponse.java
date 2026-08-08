package com.aegis.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private long activeDisasters;
    private long totalDisasters;
    private long peopleAffected;
    private long sheltersActive;
    private long shelterCapacityTotal;
    private long shelterOccupancyTotal;
    private long teamsDeployed;
    private long totalTeams;
    private long openAlerts;
    private long pendingAllocations;
    private long resourcesAvailable;
    private long totalUsers;
    private List<DisasterResponse> recentDisasters;
    private List<AlertResponse> recentAlerts;
    private List<AllocationResponse> recentAllocations;
}
