package com.fleetfix.backend.service.impl;

import com.fleetfix.backend.dto.auth.AuthResponse;
import com.fleetfix.backend.dto.auth.LoginRequest;
import com.fleetfix.backend.dto.auth.RegisterRequest;
import com.fleetfix.backend.entity.User;
import com.fleetfix.backend.exception.DuplicateResourceException;
import com.fleetfix.backend.repository.UserRepository;
import com.fleetfix.backend.security.CustomUserDetails;
import com.fleetfix.backend.security.JwtUtil;
import com.fleetfix.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        log.info("Registered new user '{}' with role {}", saved.getUsername(), saved.getRole());

        CustomUserDetails userDetails = new CustomUserDetails(saved);
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .userId(saved.getId())
                .username(saved.getUsername())
                .email(saved.getEmail())
                .role(saved.getRole())
                .token(token)
                .tokenType("Bearer")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid username or password"));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        log.info("User '{}' logged in", user.getUsername());

        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .token(token)
                .tokenType("Bearer")
                .build();
    }
}
