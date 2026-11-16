package com.shop.orders;

public record OrderItem(Long productId, int quantity, double price) {}
