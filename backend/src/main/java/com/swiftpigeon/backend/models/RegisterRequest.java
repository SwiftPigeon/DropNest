package com.laioffer.dropnest.model;

public record RegisterRequest(
        String username,
        String password,
        UserRole role
) {
}
