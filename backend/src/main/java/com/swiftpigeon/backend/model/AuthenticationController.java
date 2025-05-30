package com.swiftpigeon.backend.model;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@RequestBody RegisterRequest body) {
        // Validate required fields
        if (body.username() == null || body.username().isBlank()) {
            throw new MissingRequiredFieldException("username");
        }
        if (body.password() == null || body.password().isBlank()) {
            throw new MissingRequiredFieldException("password");
        }
        if (body.firstName() == null || body.firstName().isBlank()) {
            throw new MissingRequiredFieldException("firstName");
        }
        if (body.lastName() == null || body.lastName().isBlank()) {
            throw new MissingRequiredFieldException("lastName");
        }
        if (body.email() == null || body.email().isBlank()) {
            throw new MissingRequiredFieldException("email");
        }
        
        authenticationService.register(body);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest body) {
        String token = authenticationService.login(body.username(), body.password());
        return new LoginResponse(token);
    }
    
    /**
     * Logout endpoint that accepts token either from Authorization header or request body
     * 
     * @param authHeader Authorization header containing the JWT token (optional)
     * @param request LogoutRequest containing optional token and metadata (optional)
     * @return LogoutResponse with status information
     */
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) LogoutRequest request) {
        
        String token = null;
        String deviceInfo = null;
        String reason = "USER_INITIATED";
        
        // Extract token from header if available
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        
        // Override with request body if provided
        if (request != null) {
            // Use token from request if provided
            if (request.token() != null && !request.token().isEmpty()) {
                token = request.token();
            }
            
            // Capture device info and reason if provided
            deviceInfo = request.deviceInfo();
            if (request.reason() != null) {
                reason = request.reason();
            }
        }
        
        // Validate token
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body(LogoutResponse.invalidToken());
        }
        
        // Process logout
        boolean logoutSuccess = authenticationService.logout(token, deviceInfo, reason);
        
        if (logoutSuccess) {
            return ResponseEntity.ok(LogoutResponse.successful());
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(LogoutResponse.failed("Unable to invalidate session"));
        }
    }
    
    /**
     * Endpoint to refresh JWT token
     * 
     * @param request RefreshTokenRequest containing the old token
     * @return RefreshTokenResponse containing the new token
     */
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refreshToken(
            @RequestBody RefreshTokenRequest request) {
        
        // Validate request
        if (request.token() == null || request.token().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(RefreshTokenResponse.failed("Token is required"));
        }
        
        try {
            // Process token refresh
            String newToken = authenticationService.refreshToken(request.token());
            
            // Return successful response with new token
            return ResponseEntity.ok(RefreshTokenResponse.success(newToken));
        } catch (Exception e) {
            // Return error response
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(RefreshTokenResponse.failed(e.getMessage()));
        }
    }
}
