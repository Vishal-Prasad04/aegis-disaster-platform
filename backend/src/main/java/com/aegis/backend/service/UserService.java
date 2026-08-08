package com.aegis.backend.service;

import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.dto.response.UserResponse;
import com.aegis.backend.entity.User;
import com.aegis.backend.enums.Role;
import com.aegis.backend.exception.ResourceNotFoundException;
import com.aegis.backend.mapper.UserMapper;
import com.aegis.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public PagedResponse<UserResponse> getUsers(String role, String search) {
        List<User> users = userRepository.findAll();

        if (role != null && !role.isBlank()) {
            Role parsed = Role.fromLabel(role);
            users = users.stream().filter(u -> u.getRole() == parsed).toList();
        }

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            users = users.stream()
                    .filter(u -> u.getName().toLowerCase().contains(q) || u.getEmail().toLowerCase().contains(q))
                    .toList();
        }

        List<UserResponse> items = users.stream().map(userMapper::toResponse).toList();
        return PagedResponse.<UserResponse>builder().items(items).total(items.size()).build();
    }

    public UserResponse getById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateRole(String id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        user.setRole(Role.fromLabel(role));
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String id, String name, String phone, String region, String avatar) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));

        if (name != null && !name.isBlank()) user.setName(name);
        if (phone != null) user.setPhone(phone);
        if (region != null) user.setRegion(region);
        if (avatar != null && !avatar.isBlank()) user.setAvatar(avatar);

        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Transactional
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw ResourceNotFoundException.of("User", id);
        }
        userRepository.deleteById(id);
    }
}
