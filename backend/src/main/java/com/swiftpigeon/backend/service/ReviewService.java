package com.swiftpigeon.backend.service;

import com.swiftpigeon.backend.dto.ReviewRequest;
import com.swiftpigeon.backend.model.Review;
import com.swiftpigeon.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Transactional
    public void submitReview(String orderId, ReviewRequest request, String userId) {
        Review review = new Review();
        review.setOrderId(orderId);
        review.setUserId(userId);
        review.setContent(request.getContent());
        review.setRating(request.getRating());
        review.setTimestamp(LocalDateTime.now());
        
        reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public Optional<Review> getReviewByOrderId(String orderId) {
        return reviewRepository.findByOrderId(orderId);
    }

    @Transactional(readOnly = true)
    public List<Review> getReviewHistory(String userId) {
        return reviewRepository.findByUserIdOrderByTimestampDesc(userId);
    }
} 