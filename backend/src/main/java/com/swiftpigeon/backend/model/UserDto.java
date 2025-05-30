package com.swiftpigeon.backend.model;

public record UserDto(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        com.swiftpigeon.backend.model.UserRole role
) {
    public UserDto(com.swiftpigeon.backend.model.UserEntity entity) {
        this(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getFirstName(),
                entity.getLastName(),
                entity.getRole()
        );
    }
}

