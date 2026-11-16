package com.shop.orders;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @GetMapping("/products")
    public Collection<Product> products() {
        return service.products();
    }

    @GetMapping("/orders")
    public List<Order> orders() {
        return service.orders();
    }

    @PostMapping("/orders")
    public Order create(@RequestBody CreateOrderRequest req) {
        return service.createOrder(req.customer(), req.items());
    }

    @PatchMapping("/products/{id}/stock")
    public Product setStock(@PathVariable Long id, @RequestBody StockRequest req) {
        return service.setStock(id, req.stock());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> conflict(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

record CreateOrderRequest(String customer, List<OrderItem> items) {}

record StockRequest(int stock) {}
