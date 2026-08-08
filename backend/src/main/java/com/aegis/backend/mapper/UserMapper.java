package com.aegis.backend.mapper;

import com.aegis.backend.dto.response.UserResponse;
import com.aegis.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().getLabel())
                .avatar(user.getAvatar())
                .phone(user.getPhone())
                .region(user.getRegion())
                .build();
    }
}
