package com.aegis.backend.controller;

import com.aegis.backend.dto.request.AlertRequest;
import com.aegis.backend.dto.request.AlertStatusRequest;
import com.aegis.backend.dto.response.AlertResponse;
import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.service.AlertService;
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
@RequestMapping("/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Early-warning alert CRUD")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "List alerts, optionally filtered by status or priority")
    public ApiResponse<PagedResponse<AlertResponse>> getAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return ApiResponse.of(alertService.getAlerts(status, priority));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'FIELD_OFFICER')")
    @Operation(summary = "Create a new alert")
    public ResponseEntity<ApiResponse<Map<String, AlertResponse>>> createAlert(@Valid @RequestBody AlertRequest request) {
        AlertResponse created = alertService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(Map.of("alert", created), "Alert created"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'FIELD_OFFICER')")
    @Operation(summary = "Update an alert's status")
    public ApiResponse<Map<String, AlertResponse>> updateStatus(
            @PathVariable String id, @Valid @RequestBody AlertStatusRequest request) {
        return ApiResponse.of(Map.of("alert", alertService.updateStatus(id, request.getStatus())), "Alert status updated");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an alert")
    public ApiResponse<Void> deleteAlert(@PathVariable String id) {
        alertService.delete(id);
        return ApiResponse.of(null, "Alert deleted");
    }
}
