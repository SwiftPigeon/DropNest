package com.swiftpigeon.backend.controller;

import com.swiftpigeon.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Delete account with password confirmation
     * 
     * @param request Map containing the password for verification
     * @return ResponseEntity with success/failure message
     */
    @PostMapping("/delete-account")
    public ResponseEntity<Map<String, String>> deleteAccount(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        Map<String, String> response = new HashMap<>();
        
        if (password == null || password.isEmpty()) {
            response.put("message", "Password is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            boolean success = userService.deleteAccount(password);
            
            if (success) {
                response.put("message", "Account successfully deleted");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Failed to delete account");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (BadCredentialsException e) {
            response.put("message", "Incorrect password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            response.put("message", "Error processing request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Admin endpoint to delete a user account
     * 
     * @param username the username of the account to delete
     * @return ResponseEntity with success/failure message
     */
    @DeleteMapping("/admin/users/{username}")
    public ResponseEntity<Map<String, String>> deleteUserByAdmin(@PathVariable String username) {
        Map<String, String> response = new HashMap<>();
        
        try {
            boolean success = userService.deleteAccountByAdmin(username);
            
            if (success) {
                response.put("message", "User account successfully deleted");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Failed to delete user account");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (AccessDeniedException e) {
            response.put("message", "Not authorized to delete user accounts");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (UsernameNotFoundException e) {
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("message", "Error processing request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
