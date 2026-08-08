package com.aegis.backend.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Map;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    private String message;
    private int status;
    @Builder.Default
    private Instant timestamp = Instant.now();
    private String path;
    private Map<String, String> errors;
}
