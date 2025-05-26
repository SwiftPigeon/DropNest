package com.swiftpigeon.backend.models;

public record RegisterRequest(
        String username,
        String password,
        UserRole role
) {
}
