package com.swiftpigeon.backend.repository;

import com.swiftpigeon.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByOrderId(String orderId);
    List<Review> findByUserIdOrderByTimestampDesc(String userId);
} 