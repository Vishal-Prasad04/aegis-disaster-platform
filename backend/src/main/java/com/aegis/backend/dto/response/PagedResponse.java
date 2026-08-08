package com.aegis.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Matches the frontend's { items, total } envelope used by list endpoints.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PagedResponse<T> {
    private List<T> items;
    private long total;
}
