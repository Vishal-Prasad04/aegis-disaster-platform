package com.aegis.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/** Container for the small point-shaped DTOs used by the Analytics endpoints. */
public class AnalyticsResponses {

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ResponseTimePoint {
        private String date;
        private Integer minutes;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ResourceUsagePoint {
        private String category;
        private Integer allocated;
        private Integer available;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ShelterOccupancyPoint {
        private String date;
        private Integer occupancy;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class TeamPerformancePoint {
        private String team;
        private Integer tasksCompleted;
        private Integer avgResponseMin;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class DisasterTrendPoint {
        private String month;
        private Integer count;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class TrendWrapper<T> {
        private List<T> trend;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class UsageWrapper {
        private List<ResourceUsagePoint> usage;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class PerformanceWrapper {
        private List<TeamPerformancePoint> performance;
    }
}
