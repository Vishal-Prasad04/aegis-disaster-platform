package com.aegis.backend.controller;

import com.aegis.backend.dto.request.AllocationStatusRequest;
import com.aegis.backend.dto.request.AssignResourceRequest;
import com.aegis.backend.dto.response.AllocationResponse;
import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.service.AllocationService;
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
@RequestMapping("/allocations")
@RequiredArgsConstructor
@Tag(name = "Allocations", description = "Assigning resources to disasters and tracking allocation status")
public class AllocationController {

    private final AllocationService allocationService;

    @GetMapping
    @Operation(summary = "List allocations, optionally filtered by status or disaster")
    public ApiResponse<PagedResponse<AllocationResponse>> getAllocations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String disasterId) {
        return ApiResponse.of(allocationService.getAllocations(status, disasterId));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'FIELD_OFFICER')")
    @Operation(summary = "Assign a quantity of a resource to a disaster (409 if it exceeds available stock)")
    public ResponseEntity<ApiResponse<Map<String, AllocationResponse>>> assignResource(
            @Valid @RequestBody AssignResourceRequest request) {
        AllocationResponse created = allocationService.assign(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(Map.of("allocation", created), "Resource assigned"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'FIELD_OFFICER')")
    @Operation(summary = "Update an allocation's status")
    public ApiResponse<Map<String, AllocationResponse>> updateStatus(
            @PathVariable String id, @Valid @RequestBody AllocationStatusRequest request) {
        return ApiResponse.of(Map.of("allocation", allocationService.updateStatus(id, request.getStatus())), "Allocation status updated");
    }

    @GetMapping("/history")
    @Operation(summary = "Get completed/rejected allocation history, optionally filtered by disaster")
    public ApiResponse<PagedResponse<AllocationResponse>> getHistory(
            @RequestParam(required = false) String disasterId) {
        return ApiResponse.of(allocationService.getHistory(disasterId));
    }
}
