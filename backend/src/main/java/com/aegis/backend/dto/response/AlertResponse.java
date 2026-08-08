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
public class AlertResponse {
    private String id;
    private String title;
    private String priority;
    private String status;
    private String disasterId;
    private Instant createdAt;
    private String description;
}
