package com.aegis.backend.service;

import com.aegis.backend.dto.response.DashboardStatsResponse;
import com.aegis.backend.entity.Alert;
import com.aegis.backend.entity.Allocation;
import com.aegis.backend.entity.Disaster;
import com.aegis.backend.entity.Shelter;
import com.aegis.backend.enums.AlertStatus;
import com.aegis.backend.enums.AllocationStatus;
import com.aegis.backend.enums.DisasterStatus;
import com.aegis.backend.enums.ResourceStatus;
import com.aegis.backend.enums.TeamStatus;
import com.aegis.backend.mapper.AlertMapper;
import com.aegis.backend.mapper.AllocationMapper;
import com.aegis.backend.mapper.DisasterMapper;
import com.aegis.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DisasterRepository disasterRepository;
    private final ShelterRepository shelterRepository;
    private final RescueTeamRepository teamRepository;
    private final AlertRepository alertRepository;
    private final AllocationRepository allocationRepository;
    private final DisasterResourceRepository resourceRepository;
    private final UserRepository userRepository;

    private final DisasterMapper disasterMapper;
    private final AlertMapper alertMapper;
    private final AllocationMapper allocationMapper;

    public DashboardStatsResponse getStats() {
        List<Disaster> disasters = disasterRepository.findAll();
        List<Shelter> shelters = shelterRepository.findAll();
        List<Alert> alerts = alertRepository.findAll();
        List<Allocation> allocations = allocationRepository.findAll();

        long activeDisasters = disasters.stream().filter(d -> d.getStatus() == DisasterStatus.ACTIVE).count();
        long peopleAffected = disasters.stream().mapToLong(Disaster::getAffectedPopulation).sum();
        long sheltersActive = shelters.size();
        long shelterCapacity = shelters.stream().mapToLong(Shelter::getCapacity).sum();
        long shelterOccupancy = shelters.stream().mapToLong(Shelter::getOccupancy).sum();
        long teamsDeployed = teamRepository.findAll().stream().filter(t -> t.getStatus() == TeamStatus.DEPLOYED).count();
        long totalTeams = teamRepository.count();
        long openAlerts = alerts.stream().filter(a -> a.getStatus() == AlertStatus.OPEN).count();
        long pendingAllocations = allocations.stream().filter(a -> a.getStatus() == AllocationStatus.PENDING).count();
        long resourcesAvailable = resourceRepository.findAll().stream()
                .filter(r -> r.getStatus() == ResourceStatus.AVAILABLE).count();

        List<Disaster> recentDisasters = disasters.stream()
                .sorted(Comparator.comparing(Disaster::getStartedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .toList();

        List<Alert> recentAlerts = alerts.stream()
                .sorted(Comparator.comparing(Alert::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .toList();

        List<Allocation> recentAllocations = allocations.stream()
                .sorted(Comparator.comparing(Allocation::getRequestedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .toList();

        return DashboardStatsResponse.builder()
                .activeDisasters(activeDisasters)
                .totalDisasters(disasters.size())
                .peopleAffected(peopleAffected)
                .sheltersActive(sheltersActive)
                .shelterCapacityTotal(shelterCapacity)
                .shelterOccupancyTotal(shelterOccupancy)
                .teamsDeployed(teamsDeployed)
                .totalTeams(totalTeams)
                .openAlerts(openAlerts)
                .pendingAllocations(pendingAllocations)
                .resourcesAvailable(resourcesAvailable)
                .totalUsers(userRepository.count())
                .recentDisasters(recentDisasters.stream().map(disasterMapper::toResponse).toList())
                .recentAlerts(recentAlerts.stream().map(alertMapper::toResponse).toList())
                .recentAllocations(recentAllocations.stream().map(allocationMapper::toResponse).toList())
                .build();
    }
}
