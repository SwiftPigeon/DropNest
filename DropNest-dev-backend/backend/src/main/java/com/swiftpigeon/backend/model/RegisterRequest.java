package com.swiftpigeon.backend.model;

public record RegisterRequest(
        String username,
        String password,
        com.swiftpigeon.backend.model.UserRole role
) {
}
