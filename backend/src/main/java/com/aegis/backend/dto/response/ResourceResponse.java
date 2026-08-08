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
public class ResourceResponse {
    private String id;
    private String name;
    private String category;
    private Integer quantity;
    private String unit;
    private String status;
    private String warehouse;
    private Instant updatedAt;
}
