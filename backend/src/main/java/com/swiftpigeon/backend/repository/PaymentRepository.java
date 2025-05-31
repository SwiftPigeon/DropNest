package com.swiftpigeon.backend.repository;

import com.swiftpigeon.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserIdOrderByTimestampDesc(String userId);
}