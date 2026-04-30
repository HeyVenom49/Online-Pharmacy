package com.pharmacy.orders.controller;

import com.pharmacy.common.api.ApiPaginatedResponse;
import com.pharmacy.common.feign.OrderSummaryDTO;
import com.pharmacy.orders.dto.OrderDTO;
import com.pharmacy.orders.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalOrdersController {

    private final OrderService orderService;

    @GetMapping("/orders")
    public ResponseEntity<ApiPaginatedResponse<List<OrderSummaryDTO>>> getAllOrders(Pageable pageable) {
        Page<OrderSummaryDTO> orders = orderService.getAllOrdersForAdmin(pageable);
        return ResponseEntity.ok(ApiPaginatedResponse.of(orders.getContent(), orders));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderByIdForAdmin(orderId));
    }
}
