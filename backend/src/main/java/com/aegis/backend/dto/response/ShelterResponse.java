package com.aegis.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShelterResponse {
    private String id;
    private String name;
    private String location;
    private Integer capacity;
    private Integer occupancy;
    private String food;
    private String water;
    private String medical;
    private String disasterId;
}
