package com.fleetfix.backend.service;

import com.fleetfix.backend.dto.auth.AuthResponse;
import com.fleetfix.backend.dto.auth.LoginRequest;
import com.fleetfix.backend.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
