package com.shop.orders;

public record Product(
        Long id,
        String name,
        double price,
        int stock,
        String category,
        String description,
        String imageUrl
) {}
