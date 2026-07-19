package com.fleetfix.backend.dto.auth;

import com.fleetfix.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Long userId;
    private String username;
    private String email;
    private Role role;
    private String token;
    private String tokenType;
}
