package com.aegis.backend.controller;

import com.aegis.backend.dto.request.ResourceRequest;
import com.aegis.backend.dto.request.ResourceUpdateRequest;
import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.dto.response.ResourceResponse;
import com.aegis.backend.service.ResourceService;
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
@RequestMapping("/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Relief resource inventory CRUD")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    @Operation(summary = "List resources, optionally filtered by search text, category, or status")
    public ApiResponse<PagedResponse<ResourceResponse>> getResources(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return ApiResponse.of(resourceService.getResources(search, category, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single resource")
    public ApiResponse<Map<String, ResourceResponse>> getResource(@PathVariable String id) {
        return ApiResponse.of(Map.of("resource", resourceService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(summary = "Create a new resource entry")
    public ResponseEntity<ApiResponse<Map<String, ResourceResponse>>> createResource(@Valid @RequestBody ResourceRequest request) {
        ResourceResponse created = resourceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(Map.of("resource", created), "Resource created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(summary = "Update a resource entry")
    public ApiResponse<Map<String, ResourceResponse>> updateResource(
            @PathVariable String id, @RequestBody ResourceUpdateRequest request) {
        return ApiResponse.of(Map.of("resource", resourceService.update(id, request)), "Resource updated");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a resource entry")
    public ApiResponse<Void> deleteResource(@PathVariable String id) {
        resourceService.delete(id);
        return ApiResponse.of(null, "Resource deleted");
    }
}
