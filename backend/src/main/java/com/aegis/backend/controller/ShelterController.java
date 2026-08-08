package com.aegis.backend.controller;

import com.aegis.backend.dto.request.ShelterRequest;
import com.aegis.backend.dto.request.ShelterUpdateRequest;
import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.dto.response.ShelterResponse;
import com.aegis.backend.service.ShelterService;
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
@RequestMapping("/shelters")
@RequiredArgsConstructor
@Tag(name = "Shelters", description = "Relief shelter CRUD")
public class ShelterController {

    private final ShelterService shelterService;

    @GetMapping
    @Operation(summary = "List shelters, optionally filtered by disaster")
    public ApiResponse<PagedResponse<ShelterResponse>> getShelters(
            @RequestParam(required = false) String disasterId) {
        return ApiResponse.of(shelterService.getShelters(disasterId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single shelter")
    public ApiResponse<Map<String, ShelterResponse>> getShelter(@PathVariable String id) {
        return ApiResponse.of(Map.of("shelter", shelterService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(summary = "Create a new shelter")
    public ResponseEntity<ApiResponse<Map<String, ShelterResponse>>> createShelter(@Valid @RequestBody ShelterRequest request) {
        ShelterResponse created = shelterService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(Map.of("shelter", created), "Shelter created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(summary = "Update a shelter")
    public ApiResponse<Map<String, ShelterResponse>> updateShelter(
            @PathVariable String id, @RequestBody ShelterUpdateRequest request) {
        return ApiResponse.of(Map.of("shelter", shelterService.update(id, request)), "Shelter updated");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a shelter")
    public ApiResponse<Void> deleteShelter(@PathVariable String id) {
        shelterService.delete(id);
        return ApiResponse.of(null, "Shelter deleted");
    }
}
