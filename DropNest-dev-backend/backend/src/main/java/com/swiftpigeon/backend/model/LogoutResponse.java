package com.swiftpigeon.backend.model;

import java.time.LocalDateTime;

public record LogoutResponse(
    boolean success,
    String message,
    LocalDateTime logoutTime,
    String sessionStatus
) {
    // Static factory methods for common responses
    public static LogoutResponse successful() {
        return new LogoutResponse(
            true,
            "Logout successful",
            LocalDateTime.now(),
            "TERMINATED"
        );
    }
    
    public static LogoutResponse failed(String reason) {
        return new LogoutResponse(
            false,
            "Logout failed: " + reason,
            LocalDateTime.now(),
            "ACTIVE"
        );
    }
    
    public static LogoutResponse invalidToken() {
        return new LogoutResponse(
            false,
            "Invalid or missing token",
            LocalDateTime.now(),
            "UNKNOWN"
        );
    }
}
