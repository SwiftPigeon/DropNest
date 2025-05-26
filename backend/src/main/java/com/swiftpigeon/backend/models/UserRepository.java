package com.SwiftPigeon.backend.model;


import com.SwiftPigeon.backend.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository extends JpaRepository<UserEntity, Long> {


    UserEntity findByUsername(String username);


    boolean existsByUsername(String username);
}
