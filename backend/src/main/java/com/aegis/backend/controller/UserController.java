package com.aegis.backend.controller;

import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.dto.response.UserResponse;
import com.aegis.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management (Admin)")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users, optionally filtered by role or search text")
    public ApiResponse<PagedResponse<UserResponse>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        return ApiResponse.of(userService.getUsers(role, search));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get a single user by id")
    public ApiResponse<UserResponse> getUser(@PathVariable String id) {
        return ApiResponse.of(userService.getById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a user")
    public ApiResponse<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ApiResponse.of(null, "User deleted");
    }
}
