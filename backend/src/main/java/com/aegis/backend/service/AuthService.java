package com.aegis.backend.service;

import com.aegis.backend.dto.request.LoginRequest;
import com.aegis.backend.dto.request.RegisterRequest;
import com.aegis.backend.dto.response.AuthResponse;
import com.aegis.backend.dto.response.UserResponse;
import com.aegis.backend.entity.RefreshToken;
import com.aegis.backend.entity.User;
import com.aegis.backend.enums.Role;
import com.aegis.backend.exception.ConflictException;
import com.aegis.backend.exception.ResourceNotFoundException;
import com.aegis.backend.exception.UnauthorizedException;
import com.aegis.backend.mapper.UserMapper;
import com.aegis.backend.repository.RefreshTokenRepository;
import com.aegis.backend.repository.UserRepository;
import com.aegis.backend.security.JwtService;
import com.aegis.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with this email already exists");
        }

        Role role = Role.VOLUNTEER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            role = Role.fromLabel(request.getRole());
        }

        String initials = deriveInitials(request.getName());

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .avatar(initials)
                .phone(request.getPhone())
                .region(request.getRegion())
                .active(true)
                .build();

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (storedToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new UnauthorizedException("Refresh token has expired, please log in again");
        }

        User user = storedToken.getUser();
        UserPrincipal principal = new UserPrincipal(user);
        String newAccessToken = jwtService.generateAccessToken(principal);

        return AuthResponse.builder()
                .user(userMapper.toResponse(user))
                .token(newAccessToken)
                .refreshToken(storedToken.getToken())
                .build();
    }

    @Transactional
    public void logout(String userId) {
        refreshTokenRepository.deleteByUser_Id(userId);
    }

    public UserResponse getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        return userMapper.toResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshTokenValue = jwtService.generateRefreshToken(principal);

        refreshTokenRepository.deleteByUser_Id(user.getId());
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenValue)
                .expiryDate(Instant.now().plusMillis(jwtService.getRefreshTokenExpirationMs()))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .user(userMapper.toResponse(user))
                .token(accessToken)
                .refreshToken(refreshTokenValue)
                .build();
    }

    private String deriveInitials(String name) {
        if (name == null || name.isBlank()) return "U";
        String[] parts = name.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(2, parts.length); i++) {
            sb.append(Character.toUpperCase(parts[i].charAt(0)));
        }
        return sb.toString();
    }
}
