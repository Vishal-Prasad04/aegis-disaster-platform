package com.aegis.backend.controller;

import com.aegis.backend.dto.request.ProfileUpdateRequest;
import com.aegis.backend.dto.response.ApiResponse;
import com.aegis.backend.dto.response.UserResponse;
import com.aegis.backend.service.UserService;
import com.aegis.backend.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "The logged-in user's own profile")
public class ProfileController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get the current user's profile")
    public ApiResponse<UserResponse> getProfile() {
        return ApiResponse.of(userService.getById(SecurityUtils.currentUserId()));
    }

    @PutMapping
    @Operation(summary = "Update the current user's profile")
    public ApiResponse<UserResponse> updateProfile(@RequestBody ProfileUpdateRequest request) {
        UserResponse updated = userService.updateProfile(
                SecurityUtils.currentUserId(), request.getName(), request.getPhone(),
                request.getRegion(), request.getAvatar());
        return ApiResponse.of(updated, "Profile updated");
    }
}
