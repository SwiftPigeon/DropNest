package com.swiftpigeon.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "item")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double weight;
    private double volume;

    public Item() {
    }

    // TODO: Setters and Getters
}
