package com.aegis.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShelterUpdateRequest {
    private String name;
    private String location;
    private Integer capacity;
    private Integer occupancy;
    private String food;
    private String water;
    private String medical;
    private String disasterId;
}
