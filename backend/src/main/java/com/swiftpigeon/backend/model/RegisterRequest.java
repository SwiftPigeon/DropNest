package com.swiftpigeon.backend.model;

public record RegisterRequest(
        String username,
        String password,
        String firstName,
        String lastName,
        String email,
        com.swiftpigeon.backend.model.UserRole role
) {
}
