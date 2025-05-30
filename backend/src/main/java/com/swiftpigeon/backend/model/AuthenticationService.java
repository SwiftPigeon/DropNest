package com.swiftpigeon.backend.model;

import com.swiftpigeon.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;
import java.time.LocalDateTime;

@Service
public class AuthenticationService {
    private static final Logger logger = Logger.getLogger(AuthenticationService.class.getName());
    
    private final AuthenticationManager authenticationManager;
    private final JwtHandler jwtHandler;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    
    // Token blacklist is now managed by JwtAuthenticationFilter

    public AuthenticationService(
            AuthenticationManager authenticationManager,
            JwtHandler jwtHandler,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtHandler = jwtHandler;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    public UserEntity register(String username, String password, String email, String firstName, String lastName, UserRole role) {
        if (userRepository.existsByUsername(username)) {
            throw new UserAlreadyExistException();
        }
        
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistException("User with this email already exists");
        }
    
        UserEntity userEntity = new UserEntity(null, username, passwordEncoder.encode(password), email, firstName, lastName, role);
        return userRepository.save(userEntity);
    }
    
    public UserEntity register(String username, String password, UserRole role) {
        return register(username, password, null, null, null, role);
    }
    
    public UserEntity register(RegisterRequest request) {
        return register(
            request.username(), 
            request.password(), 
            request.email(),
            request.firstName(),
            request.lastName(),
            request.role()
        );
    }

    public String login(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        return jwtHandler.generateToken(username);
    }
    
    /**
     * Invalidates the JWT token for logout with additional metadata
     * 
     * @param token the JWT token to invalidate
     * @param deviceInfo optional information about the device
     * @param reason reason for logout
     * @return true if logout was successful, false otherwise
     */
    public boolean logout(String token, String deviceInfo, String reason) {
        try {
            // Extract username for logging purposes
            String username = null;
            try {
                username = jwtHandler.parsedUsername(token);
            } catch (Exception e) {
                // Token might be invalid, but we'll still blacklist it
                logger.warning("Invalid token during logout: " + e.getMessage());
            }
            
            // Add the token to blacklist using JwtAuthenticationFilter's static method
            JwtAuthenticationFilter.blacklistToken(token);
            
            // Log the logout event with available information
            logger.info("User logged out - " +
                    "Username: " + (username != null ? username : "unknown") +
                    ", Device: " + (deviceInfo != null ? deviceInfo : "not specified") +
                    ", Reason: " + reason +
                    ", Time: " + LocalDateTime.now());
            
            return true;
        } catch (Exception e) {
            logger.severe("Error during logout: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Overloaded method for backward compatibility
     */
    public boolean logout(String token) {
        return logout(token, null, "USER_INITIATED");
    }
    
    /**
     * Checks if a token is blacklisted
     * 
     * @param token the JWT token to check
     * @return true if the token is blacklisted, false otherwise
     */
    public boolean isTokenBlacklisted(String token) {
        return JwtAuthenticationFilter.isTokenBlacklisted(token);
    }
    
    /**
     * Refreshes a JWT token by validating the old one and generating a new one
     * 
     * @param oldToken the token to refresh
     * @return a new token with extended expiration time
     * @throws RuntimeException if the token is invalid, blacklisted, or cannot be refreshed
     */
    public String refreshToken(String oldToken) {
        // Check if the token is blacklisted
        if (isTokenBlacklisted(oldToken)) {
            throw new RuntimeException("Token has been invalidated");
        }
        
        try {
            // Validate the token first
            String username = jwtHandler.parsedUsername(oldToken);
            
            // Check if the user still exists and is valid
            if (!userRepository.existsByUsername(username)) {
                throw new RuntimeException("User no longer exists");
            }
            
            // Generate a new token using the username from the old token
            String newToken = jwtHandler.generateToken(username);
            
            // Blacklist the old token to prevent reuse
            JwtAuthenticationFilter.blacklistToken(oldToken);
            
            return newToken;
        } catch (Exception e) {
            throw new RuntimeException("Failed to refresh token: " + e.getMessage(), e);
        }
    }
}
