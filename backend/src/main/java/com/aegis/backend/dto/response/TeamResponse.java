package com.aegis.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeamResponse {
    private String id;
    private String name;
    private Integer members;
    private String vehicle;
    private String status;
    private String assignment;
    private String currentLocation;
    private String leader;
}
