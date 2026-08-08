package com.aegis.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Standard success envelope used by every endpoint: { data, message }.
 * Mirrors exactly what the frontend's axios interceptor / api/*.js files expect.
 */
@Getter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private T data;
    private String message;

    public static <T> ApiResponse<T> of(T data, String message) {
        return new ApiResponse<>(data, message);
    }

    public static <T> ApiResponse<T> of(T data) {
        return new ApiResponse<>(data, "OK");
    }
}
