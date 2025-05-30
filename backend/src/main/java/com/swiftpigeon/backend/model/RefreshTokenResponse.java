package com.swiftpigeon.backend.model;

/**
 * Response object for token refresh operations
 */
public record RefreshTokenResponse(
    String token,
    boolean success,
    String message
) {
    public static RefreshTokenResponse success(String token) {
        return new RefreshTokenResponse(token, true, "Token refreshed successfully");
    }
    
    public static RefreshTokenResponse failed(String message) {
        return new RefreshTokenResponse(null, false, message);
    }
}
