package com.aegis.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequest {
    private String name;
    private String phone;
    private String region;
    private String avatar;
}
