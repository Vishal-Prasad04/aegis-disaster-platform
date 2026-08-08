package com.aegis.backend.controller;

import com.aegis.backend.dto.response.AnalyticsResponses.*;
import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Aggregated metrics powering dashboard charts")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/response-time")
    @Operation(summary = "Response time trend, e.g. range=7d")
    public ApiResponse<TrendWrapper<ResponseTimePoint>> getResponseTimeTrend(
            @RequestParam(required = false, defaultValue = "7d") String range) {
        return ApiResponse.of(analyticsService.getResponseTimeTrend(range));
    }

    @GetMapping("/resource-usage")
    @Operation(summary = "Resource usage by category")
    public ApiResponse<UsageWrapper> getResourceUsage() {
        return ApiResponse.of(analyticsService.getResourceUsage());
    }

    @GetMapping("/shelter-occupancy")
    @Operation(summary = "Shelter occupancy trend, e.g. range=7d")
    public ApiResponse<TrendWrapper<ShelterOccupancyPoint>> getShelterOccupancyTrend(
            @RequestParam(required = false, defaultValue = "7d") String range) {
        return ApiResponse.of(analyticsService.getShelterOccupancyTrend(range));
    }

    @GetMapping("/team-performance")
    @Operation(summary = "Per-team task completion and average response time")
    public ApiResponse<PerformanceWrapper> getTeamPerformance() {
        return ApiResponse.of(analyticsService.getTeamPerformance());
    }

    @GetMapping("/disaster-trends")
    @Operation(summary = "Disaster count trend by month, e.g. range=6m")
    public ApiResponse<TrendWrapper<DisasterTrendPoint>> getDisasterTrends(
            @RequestParam(required = false, defaultValue = "6m") String range) {
        return ApiResponse.of(analyticsService.getDisasterTrends(range));
    }
}
