package com.swiftpigeon.backend.model;


import java.time.LocalDateTime;

public record LogoutRequest(
    String token,                     // Optional token if not provided in header
    String deviceInfo,                // Information about the device logging out
    String reason,                    // Reason for logout (e.g., "USER_INITIATED", "SESSION_EXPIRED")
    LocalDateTime logoutTime          // Time of logout request
) {
    // Constructor with default values for optional fields
    public LogoutRequest(String token) {
        this(token, null, "USER_INITIATED", LocalDateTime.now());
    }
    
    // Constructor with just token and device info
    public LogoutRequest(String token, String deviceInfo) {
        this(token, deviceInfo, "USER_INITIATED", LocalDateTime.now());
    }
}
