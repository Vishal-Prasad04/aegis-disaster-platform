package com.aegis.backend.controller;

import com.aegis.backend.dto.request.*;
import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.dto.response.AuthResponse;
import com.aegis.backend.dto.response.UserResponse;
import com.aegis.backend.service.AuthService;
import com.aegis.backend.service.UserService;
import com.aegis.backend.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, refresh, and current-session endpoints")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    @Operation(summary = "Login with email and password, returns a JWT + refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.of(response, "Login successful"));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(response, "Registration successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a refresh token for a new access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.of(response, "Token refreshed"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out the current user and invalidate their refresh token")
    public ResponseEntity<ApiResponse<Void>> logout() {
        String userId = SecurityUtils.currentUserId();
        if (userId != null) {
            authService.logout(userId);
        }
        return ResponseEntity.ok(ApiResponse.of(null, "Logged out"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get the currently authenticated user")
    public ResponseEntity<ApiResponse<java.util.Map<String, UserResponse>>> getCurrentUser() {
        String userId = SecurityUtils.currentUserId();
        UserResponse user = userService.getById(userId);
        return ResponseEntity.ok(ApiResponse.of(java.util.Map.of("user", user)));
    }

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a user's role (Admin only)")
    public ResponseEntity<ApiResponse<java.util.Map<String, UserResponse>>> updateUserRole(
            @PathVariable String id, @Valid @RequestBody RoleUpdateRequest request) {
        UserResponse user = userService.updateRole(id, request.getRole());
        return ResponseEntity.ok(ApiResponse.of(java.util.Map.of("user", user), "Role updated"));
    }
}
