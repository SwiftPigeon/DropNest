package com.swiftpigeon.backend.model;

/**
 * Request object for token refresh operations
 */
public record RefreshTokenRequest(
    String token
) {}
