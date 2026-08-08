package com.aegis.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResourceUpdateRequest {
    private String name;
    private String category;
    private Integer quantity;
    private String unit;
    private String status;
    private String warehouse;
}
