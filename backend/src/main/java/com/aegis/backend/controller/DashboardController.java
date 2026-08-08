package com.aegis.backend.controller;

import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.dto.response.DashboardStatsResponse;
import com.aegis.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Aggregated statistics for the main dashboard screen")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get aggregated dashboard statistics and recent activity")
    public ApiResponse<DashboardStatsResponse> getStats() {
        return ApiResponse.of(dashboardService.getStats());
    }
}
