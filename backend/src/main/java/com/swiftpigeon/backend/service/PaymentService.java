package com.swiftpigeon.backend.service;

import com.swiftpigeon.backend.dto.PaymentRequest;
import com.swiftpigeon.backend.model.Payment;
import com.swiftpigeon.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public void pay(PaymentRequest request, String userId) {
        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setOrderId(request.getOrderId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTimestamp(LocalDateTime.now());
        
        paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentHistory(String userId) {
        return paymentRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}