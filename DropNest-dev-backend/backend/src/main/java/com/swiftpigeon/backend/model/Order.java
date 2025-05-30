package com.swiftpigeon.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private com.swiftpigeon.backend.model.OrderStatus status;  // CREATED, CONFIRMED, DELIVERING, DELIVERED

    @Enumerated(EnumType.STRING)
    private OrderMethod method;    // Robot or Drone
    @Enumerated(EnumType.STRING)
    private com.swiftpigeon.backend.model.UserPreference preference;    // Speed-First or Cost-First

    private double price;

    private long ets;       // estimated time seconds

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "order_id")
    private List<Item> items;

    private LocalDateTime createdAt;

    public Order() {
    }

    // TODO: Setters and Getters
}
