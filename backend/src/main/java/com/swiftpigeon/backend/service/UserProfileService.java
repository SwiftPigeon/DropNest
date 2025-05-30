package com.swiftpigeon.backend.service;

import com.swiftpigeon.backend.dto.UserProfileDTO;
import com.swiftpigeon.backend.model.Address;
import com.swiftpigeon.backend.model.UserEntity;
import com.swiftpigeon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

@Service
public class UserProfileService {

    private final UserRepository userRepository;

    @Autowired
    public UserProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get the current authenticated user's profile
     * @return UserProfileDTO with user profile information
     */
    public UserProfileDTO getCurrentUserProfile() {
        UserEntity user = getCurrentUser();
        return new UserProfileDTO(user);
    }

    /**
     * Update the current authenticated user's profile
     * @param profileDTO The updated profile information
     * @return Updated UserProfileDTO
     */
    @Transactional
    public UserProfileDTO updateUserProfile(UserProfileDTO profileDTO) {
        UserEntity user = getCurrentUser();
        
        // Update user fields
        user.setFirstName(profileDTO.firstName());
        user.setLastName(profileDTO.lastName());
        
        // Update email if provided
        if (profileDTO.email() != null && !profileDTO.email().isEmpty()) {
            user.setEmail(profileDTO.email());
        }
        
        // Update or create address
        if (profileDTO.address() != null) {
            Address address = user.getAddress();
            if (address == null) {
                address = profileDTO.address().toEntity();
            } else {
                address.setProvince(profileDTO.address().province());
                address.setCity(profileDTO.address().city());
                address.setStreet(profileDTO.address().street());
                address.setPostcode(profileDTO.address().postcode());
            }
            user.setAddress(address);
        }
        
        UserEntity savedUser = userRepository.save(user);
        return new UserProfileDTO(savedUser);
    }
    
    /**
     * Get the current authenticated user
     * @return UserEntity of the current user
     * @throws UsernameNotFoundException if user not found
     */
    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
