package com.aegis.backend.controller;

import com.aegis.backend.dto.request.TeamAssignRequest;
import com.aegis.backend.dto.request.TeamRequest;
import com.aegis.backend.dto.request.TeamUpdateRequest;
import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.dto.response.TeamResponse;
import com.aegis.backend.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
@Tag(name = "Rescue Teams", description = "Rescue team CRUD and deployment")
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    @Operation(summary = "List rescue teams, optionally filtered by status or assignment")
    public ApiResponse<PagedResponse<TeamResponse>> getTeams(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignment) {
        return ApiResponse.of(teamService.getTeams(status, assignment));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single rescue team")
    public ApiResponse<Map<String, TeamResponse>> getTeam(@PathVariable String id) {
        return ApiResponse.of(Map.of("team", teamService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(summary = "Create a new rescue team")
    public ResponseEntity<ApiResponse<Map<String, TeamResponse>>> createTeam(@Valid @RequestBody TeamRequest request) {
        TeamResponse created = teamService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(Map.of("team", created), "Rescue team created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(summary = "Update a rescue team")
    public ApiResponse<Map<String, TeamResponse>> updateTeam(
            @PathVariable String id, @RequestBody TeamUpdateRequest request) {
        return ApiResponse.of(Map.of("team", teamService.update(id, request)), "Rescue team updated");
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(summary = "Assign (or unassign) a rescue team to a disaster")
    public ApiResponse<Map<String, TeamResponse>> assignTeam(
            @PathVariable String id, @RequestBody TeamAssignRequest request) {
        return ApiResponse.of(Map.of("team", teamService.assign(id, request.getDisasterId())), "Rescue team assigned");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a rescue team")
    public ApiResponse<Void> deleteTeam(@PathVariable String id) {
        teamService.delete(id);
        return ApiResponse.of(null, "Rescue team deleted");
    }
}
