package com.aegis.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllocationResponse {
    private String id;
    private String resourceId;
    private String resourceName;
    private String disasterId;
    private String disasterName;
    private Integer quantity;
    private String status;
    private String requestedBy;
    private Instant requestedAt;
    private Instant completedAt;
}
