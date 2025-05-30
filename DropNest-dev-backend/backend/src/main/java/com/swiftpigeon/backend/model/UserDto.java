package com.swiftpigeon.backend.model;

public record UserDto(
        Long id,
        String username,
        com.swiftpigeon.backend.model.UserRole role
) {
    public UserDto(com.swiftpigeon.backend.model.UserEntity entity) {
        this(
                entity.getId(),
                entity.getUsername(),
                entity.getRole()
        );
    }
}

