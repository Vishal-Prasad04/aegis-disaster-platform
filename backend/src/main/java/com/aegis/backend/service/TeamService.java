package com.aegis.backend.service;

import com.aegis.backend.dto.request.TeamRequest;
import com.aegis.backend.dto.request.TeamUpdateRequest;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.dto.response.TeamResponse;
import com.aegis.backend.entity.Disaster;
import com.aegis.backend.entity.RescueTeam;
import com.aegis.backend.enums.TeamStatus;
import com.aegis.backend.exception.ResourceNotFoundException;
import com.aegis.backend.mapper.TeamMapper;
import com.aegis.backend.repository.DisasterRepository;
import com.aegis.backend.repository.RescueTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final RescueTeamRepository teamRepository;
    private final DisasterRepository disasterRepository;
    private final TeamMapper teamMapper;

    public PagedResponse<TeamResponse> getTeams(String status, String assignment) {
        Specification<RescueTeam> spec = Specification.where(null);

        if (StringUtils.hasText(status)) {
            TeamStatus s = TeamStatus.fromLabel(status);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), s));
        }
        if (StringUtils.hasText(assignment)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("assignment").get("id"), assignment));
        }

        List<RescueTeam> results = teamRepository.findAll(spec);
        List<TeamResponse> items = results.stream().map(teamMapper::toResponse).toList();
        return PagedResponse.<TeamResponse>builder().items(items).total(items.size()).build();
    }

    public TeamResponse getById(String id) {
        RescueTeam team = teamRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Rescue team", id));
        return teamMapper.toResponse(team);
    }

    @Transactional
    public TeamResponse create(TeamRequest request) {
        RescueTeam team = RescueTeam.builder()
                .name(request.getName())
                .members(request.getMembers())
                .vehicle(request.getVehicle())
                .status(StringUtils.hasText(request.getStatus()) ? TeamStatus.fromLabel(request.getStatus()) : TeamStatus.STANDBY)
                .assignment(resolveDisaster(request.getAssignment()))
                .currentLocation(request.getCurrentLocation())
                .leader(request.getLeader())
                .build();

        team = teamRepository.save(team);
        return teamMapper.toResponse(team);
    }

    @Transactional
    public TeamResponse update(String id, TeamUpdateRequest request) {
        RescueTeam team = teamRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Rescue team", id));

        if (request.getName() != null) team.setName(request.getName());
        if (request.getMembers() != null) team.setMembers(request.getMembers());
        if (request.getVehicle() != null) team.setVehicle(request.getVehicle());
        if (request.getStatus() != null) team.setStatus(TeamStatus.fromLabel(request.getStatus()));
        // Note: assignment is applied unconditionally (not "if not null") because
        // the frontend's edit form (RescueTeams.jsx) sends `assignment: null`
        // on purpose to clear a team's disaster assignment - unlike the other
        // fields here, null is a meaningful, intentional value for this one,
        // not "field omitted". resolveDisaster(null) correctly returns null.
        team.setAssignment(resolveDisaster(request.getAssignment()));
        if (request.getCurrentLocation() != null) team.setCurrentLocation(request.getCurrentLocation());
        if (request.getLeader() != null) team.setLeader(request.getLeader());

        team = teamRepository.save(team);
        return teamMapper.toResponse(team);
    }

    @Transactional
    public TeamResponse assign(String id, String disasterId) {
        RescueTeam team = teamRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Rescue team", id));

        team.setAssignment(resolveDisaster(disasterId));
        team.setStatus(StringUtils.hasText(disasterId) ? TeamStatus.DEPLOYED : TeamStatus.STANDBY);

        team = teamRepository.save(team);
        return teamMapper.toResponse(team);
    }

    @Transactional
    public void delete(String id) {
        if (!teamRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Rescue team", id);
        }
        teamRepository.deleteById(id);
    }

    private Disaster resolveDisaster(String disasterId) {
        if (!StringUtils.hasText(disasterId)) return null;
        return disasterRepository.findById(disasterId)
                .orElseThrow(() -> ResourceNotFoundException.of("Disaster", disasterId));
    }
}
