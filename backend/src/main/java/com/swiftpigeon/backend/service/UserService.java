package com.swiftpigeon.backend.service;

import com.swiftpigeon.backend.model.UserEntity;
import com.swiftpigeon.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Deletes account after verifying password
     * 
     * @param password the user's password for verification
     * @return true if deletion was successful, false otherwise
     * @throws BadCredentialsException if the provided password is incorrect
     * @throws UsernameNotFoundException if user not found
     */
    @Transactional
    public boolean deleteAccount(String password) {
        // Get the authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        // Find the user
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }
        
        try {
            // Delete the user
            userRepository.delete(user);
            return true;
        } catch (Exception e) {
            // Log the error
            System.err.println("Error deleting account: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Admin method to delete a user account
     * 
     * @param username the username of the account to delete
     * @return true if deletion was successful, false otherwise
     * @throws AccessDeniedException if the authenticated user is not an admin
     * @throws UsernameNotFoundException if user not found
     */
    @Transactional
    public boolean deleteAccountByAdmin(String username) {
        // Get the authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        // Only allow admins to use this method
        if (!auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new AccessDeniedException("Only administrators can delete other accounts");
        }
        
        // Find the user
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        try {
            // Delete the user
            userRepository.delete(user);
            return true;
        } catch (Exception e) {
            // Log the error
            System.err.println("Error deleting account: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Change user password by verifying old password
     *
     * @param oldPassword the current password for verification
     * @param newPassword the new password to set
     * @return true if password was changed successfully
     * @throws BadCredentialsException if old password doesn't match
     * @throws UsernameNotFoundException if user not found
     */
    @Transactional
    public boolean changePassword(String oldPassword, String newPassword) {
        // Get currently authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        UserEntity user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadCredentialsException("Incorrect password");
        }
        
        // Set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return true;
    }
}
