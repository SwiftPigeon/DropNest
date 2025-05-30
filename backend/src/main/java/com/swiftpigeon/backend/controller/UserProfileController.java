package com.swiftpigeon.backend.controller;

import com.swiftpigeon.backend.dto.UserProfileDTO;
import com.swiftpigeon.backend.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @Autowired
    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    /**
     * Get the current user's profile
     * 
     * @return ResponseEntity containing UserProfileDTO
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile() {
        UserProfileDTO profile = userProfileService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }

    /**
     * Update the current user's profile
     * 
     * @param profileDTO The updated profile data
     * @return ResponseEntity containing updated UserProfileDTO
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateUserProfile(@RequestBody UserProfileDTO profileDTO) {
        UserProfileDTO updatedProfile = userProfileService.updateUserProfile(profileDTO);
        return ResponseEntity.ok(updatedProfile);
    }
}
