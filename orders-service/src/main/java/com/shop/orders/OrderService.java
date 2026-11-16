package com.shop.orders;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    private final Map<Long, Product> products = new ConcurrentHashMap<>();
    private final List<Order> orders = new CopyOnWriteArrayList<>();
    private final AtomicLong orderSeq = new AtomicLong(1000);

    public OrderService() {
        seed();
    }

    private void seed() {
        put(1L, "Aurora Headphones",   129.99,  40, "audio",    "Wireless over-ear noise cancelling headphones");
        put(2L, "Pulse Earbuds",        59.50, 120, "audio",    "True wireless earbuds with charging case");
        put(3L, "Nimbus Keyboard",      89.00,  30, "input",    "Mechanical keyboard with hot-swappable switches");
        put(4L, "Vector Mouse",         45.00,  75, "input",    "Lightweight ergonomic wireless mouse");
        put(5L, "Lumen Monitor 27",    329.00,  15, "display",  "27 inch 4K IPS monitor with USB-C power delivery");
        put(6L, "Halo Desk Lamp",       39.99,  60, "lighting", "Adjustable LED desk lamp with warm and cool modes");
        put(7L, "Orbit Webcam",         74.99,  25, "camera",   "1080p webcam with auto framing and dual microphones");
        put(8L, "Cascade Speaker",     149.00,  18, "audio",    "Portable bluetooth speaker with 20 hour battery");
    }

    private void put(Long id, String name, double price, int stock, String category, String description) {
        products.put(id, new Product(
                id, name, price, stock, category, description,
                "/img/placeholder?w=320&h=240"
        ));
    }

    public Collection<Product> products() {
        return products.values().stream().sorted(Comparator.comparing(Product::id)).toList();
    }

    public List<Order> orders() {
        return List.copyOf(orders);
    }

    public synchronized Order createOrder(String customer, List<OrderItem> items) {
        if (customer == null || customer.isBlank()) {
            throw new IllegalArgumentException("customer is required");
        }
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("order must contain at least one item");
        }

        for (OrderItem item : items) {
            Product p = products.get(item.productId());
            if (p == null) {
                throw new IllegalArgumentException("unknown product " + item.productId());
            }
            if (item.quantity() <= 0) {
                throw new IllegalArgumentException("quantity must be positive for product " + p.id());
            }
            if (p.stock() < item.quantity()) {
                throw new IllegalStateException("insufficient stock for " + p.name());
            }
        }

        List<OrderItem> priced = new ArrayList<>();
        double total = 0;
        for (OrderItem item : items) {
            Product p = products.get(item.productId());
            priced.add(new OrderItem(p.id(), item.quantity(), p.price()));
            total += p.price() * item.quantity();
        }

        for (OrderItem item : priced) {
            Product p = products.get(item.productId());
            products.put(p.id(), new Product(
                    p.id(), p.name(), p.price(), p.stock() - item.quantity(),
                    p.category(), p.description(), p.imageUrl()
            ));
        }

        Order order = new Order(
                orderSeq.incrementAndGet(), customer, priced,
                Math.round(total * 100) / 100.0, "CONFIRMED"
        );
        orders.add(order);
        return order;
    }

    public Product setStock(Long id, int stock) {
        Product p = products.get(id);
        if (p == null) throw new IllegalArgumentException("unknown product " + id);
        if (stock < 0) throw new IllegalArgumentException("stock must be >= 0");
        Product updated = new Product(
                p.id(), p.name(), p.price(), stock, p.category(), p.description(), p.imageUrl()
        );
        products.put(id, updated);
        return updated;
    }
}
