package com.swiftpigeon.backend.controller;

import com.swiftpigeon.backend.dto.ReviewRequest;
import com.swiftpigeon.backend.model.Review;
import com.swiftpigeon.backend.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/{orderId}/review")
    public ResponseEntity<Void> submitReview(
            @PathVariable String orderId,
            @RequestBody ReviewRequest request) {
        String userId = getCurrentUserId();
        reviewService.submitReview(orderId, request, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{orderId}/review")
    public ResponseEntity<Review> getReview(@PathVariable String orderId) {
        Optional<Review> review = reviewService.getReviewByOrderId(orderId);
        if (review.isPresent()) {
            return ResponseEntity.ok(review.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
} 