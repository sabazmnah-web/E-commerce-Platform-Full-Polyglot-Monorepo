package com.shop.orders;

import java.util.List;

public record Order(
        Long id,
        String customer,
        List<OrderItem> items,
        double total,
        String status
) {}
