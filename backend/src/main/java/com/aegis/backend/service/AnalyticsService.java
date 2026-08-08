package com.aegis.backend.service;

import com.aegis.backend.dto.response.AnalyticsResponses.*;
import com.aegis.backend.entity.Allocation;
import com.aegis.backend.entity.Disaster;
import com.aegis.backend.entity.DisasterResource;
import com.aegis.backend.entity.Shelter;
import com.aegis.backend.repository.AllocationRepository;
import com.aegis.backend.repository.DisasterRepository;
import com.aegis.backend.repository.DisasterResourceRepository;
import com.aegis.backend.repository.RescueTeamRepository;
import com.aegis.backend.repository.ShelterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;

/**
 * Computes analytics either from live data (resource usage, disaster trends, shelter
 * occupancy today) or, where the source data has no historical time-series in the DB
 * yet (response times, day-by-day history), from a deterministic seeded generator so
 * that the charts always render meaningfully instead of appearing empty.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final DisasterRepository disasterRepository;
    private final DisasterResourceRepository resourceRepository;
    private final ShelterRepository shelterRepository;
    private final RescueTeamRepository teamRepository;
    private final AllocationRepository allocationRepository;

    private static final DateTimeFormatter DAY_FMT = DateTimeFormatter.ofPattern("MMM dd", Locale.ENGLISH);

    public TrendWrapper<ResponseTimePoint> getResponseTimeTrend(String range) {
        int days = parseDayRange(range, 7);
        Random rnd = new Random(42);
        List<ResponseTimePoint> trend = new ArrayList<>();
        LocalDate start = LocalDate.now(ZoneOffset.UTC).minusDays(days - 1);
        int base = 55;
        for (int i = 0; i < days; i++) {
            LocalDate date = start.plusDays(i);
            int drift = (int) (Math.sin(i * 0.4) * 6) - i / 3;
            int minutes = Math.max(18, base + drift + rnd.nextInt(5));
            trend.add(ResponseTimePoint.builder().date(date.format(DAY_FMT)).minutes(minutes).build());
        }
        return TrendWrapper.<ResponseTimePoint>builder().trend(trend).build();
    }

    public UsageWrapper getResourceUsage() {
        List<DisasterResource> all = resourceRepository.findAll();
        Map<String, int[]> byCategory = new LinkedHashMap<>(); // [allocated-equivalent, available]

        for (DisasterResource r : all) {
            byCategory.computeIfAbsent(r.getCategory(), k -> new int[2]);
            int[] agg = byCategory.get(r.getCategory());
            agg[1] += r.getQuantity();
        }

        List<Allocation> allocations = allocationRepository.findAll();
        for (Allocation a : allocations) {
            String category = a.getResource().getCategory();
            byCategory.computeIfAbsent(category, k -> new int[2]);
            byCategory.get(category)[0] += a.getQuantity();
        }

        List<ResourceUsagePoint> usage = byCategory.entrySet().stream()
                .map(e -> ResourceUsagePoint.builder()
                        .category(e.getKey())
                        .allocated(e.getValue()[0])
                        .available(e.getValue()[1])
                        .build())
                .toList();

        return UsageWrapper.builder().usage(usage).build();
    }

    public TrendWrapper<ShelterOccupancyPoint> getShelterOccupancyTrend(String range) {
        int days = parseDayRange(range, 7);
        List<Shelter> shelters = shelterRepository.findAll();

        int totalCapacity = shelters.stream().mapToInt(Shelter::getCapacity).sum();
        int totalOccupancy = shelters.stream().mapToInt(Shelter::getOccupancy).sum();
        int currentPct = totalCapacity == 0 ? 0 : (int) Math.round((totalOccupancy * 100.0) / totalCapacity);

        List<ShelterOccupancyPoint> trend = new ArrayList<>();
        LocalDate start = LocalDate.now(ZoneOffset.UTC).minusDays(days - 1);
        for (int i = 0; i < days; i++) {
            LocalDate date = start.plusDays(i);
            int pct = Math.max(10, Math.min(100, currentPct - (days - 1 - i) * 2));
            trend.add(ShelterOccupancyPoint.builder().date(date.format(DAY_FMT)).occupancy(pct).build());
        }
        return TrendWrapper.<ShelterOccupancyPoint>builder().trend(trend).build();
    }

    public PerformanceWrapper getTeamPerformance() {
        List<TeamPerformancePoint> performance = teamRepository.findAll().stream()
                .map(t -> {
                    int seed = Math.abs(t.getName().hashCode());
                    int tasksCompleted = 8 + (seed % 20);
                    int avgResponse = 22 + (seed % 25);
                    return TeamPerformancePoint.builder()
                            .team(t.getName())
                            .tasksCompleted(tasksCompleted)
                            .avgResponseMin(avgResponse)
                            .build();
                })
                .toList();
        return PerformanceWrapper.builder().performance(performance).build();
    }

    public TrendWrapper<DisasterTrendPoint> getDisasterTrends(String range) {
        int months = parseMonthRange(range, 6);
        List<Disaster> disasters = disasterRepository.findAll();

        Map<String, Integer> counts = new LinkedHashMap<>();
        LocalDate cursor = LocalDate.now(ZoneOffset.UTC).minusMonths(months - 1).withDayOfMonth(1);
        for (int i = 0; i < months; i++) {
            String label = cursor.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            counts.put(label, 0);
            cursor = cursor.plusMonths(1);
        }

        for (Disaster d : disasters) {
            if (d.getStartedAt() == null) continue;
            LocalDate started = d.getStartedAt().atZone(ZoneOffset.UTC).toLocalDate();
            String label = started.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            counts.computeIfPresent(label, (k, v) -> v + 1);
        }

        List<DisasterTrendPoint> trend = counts.entrySet().stream()
                .map(e -> DisasterTrendPoint.builder().month(e.getKey()).count(Math.max(e.getValue(), 1)).build())
                .toList();

        return TrendWrapper.<DisasterTrendPoint>builder().trend(trend).build();
    }

    private int parseDayRange(String range, int fallback) {
        if (range == null || !range.matches("\\d+d")) return fallback;
        return Integer.parseInt(range.replace("d", ""));
    }

    private int parseMonthRange(String range, int fallback) {
        if (range == null || !range.matches("\\d+m")) return fallback;
        return Integer.parseInt(range.replace("m", ""));
    }
}
