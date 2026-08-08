package com.aegis.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamUpdateRequest {
    private String name;
    private Integer members;
    private String vehicle;
    private String status;
    private String assignment;
    private String currentLocation;
    private String leader;
}
