package com.aegis.backend.controller;

import com.aegis.backend.dto.request.DisasterRequest;
import com.aegis.backend.dto.request.DisasterUpdateRequest;
import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.dto.response.DisasterResponse;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.service.DisasterService;
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
@RequestMapping("/disasters")
@RequiredArgsConstructor
@Tag(name = "Disasters", description = "Disaster reports CRUD")
public class DisasterController {

    private final DisasterService disasterService;

    @GetMapping
    @Operation(summary = "List disasters, optionally filtered by status, priority, or search text")
    public ApiResponse<PagedResponse<DisasterResponse>> getDisasters(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search) {
        return ApiResponse.of(disasterService.getDisasters(status, priority, search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single disaster report")
    public ApiResponse<Map<String, DisasterResponse>> getDisaster(@PathVariable String id) {
        return ApiResponse.of(Map.of("disaster", disasterService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(summary = "Create a new disaster report")
    public ResponseEntity<ApiResponse<Map<String, DisasterResponse>>> createDisaster(
            @Valid @RequestBody DisasterRequest request) {
        DisasterResponse created = disasterService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(Map.of("disaster", created), "Disaster report created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(summary = "Update a disaster report")
    public ApiResponse<Map<String, DisasterResponse>> updateDisaster(
            @PathVariable String id, @RequestBody DisasterUpdateRequest request) {
        return ApiResponse.of(Map.of("disaster", disasterService.update(id, request)), "Disaster report updated");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a disaster report")
    public ApiResponse<Void> deleteDisaster(@PathVariable String id) {
        disasterService.delete(id);
        return ApiResponse.of(null, "Disaster report deleted");
    }
}
