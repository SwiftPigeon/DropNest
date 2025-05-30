package com.swiftpigeon.backend.controller;

import com.swiftpigeon.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/password")
public class PasswordResetController {

    private final UserService userService;
    
    @Autowired
    public PasswordResetController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * Change password by verifying the old password
     * 
     * @param request Map containing oldPassword and newPassword
     * @return ResponseEntity with success/failure message
     */
    @PostMapping("/change")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        
        if (oldPassword == null || newPassword == null) {
            response.put("message", "Old password and new password are required");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            boolean success = userService.changePassword(oldPassword, newPassword);
            
            if (success) {
                response.put("message", "Password successfully changed");
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Failed to change password");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (BadCredentialsException e) {
            response.put("message", "Incorrect old password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            response.put("message", "Error processing request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
