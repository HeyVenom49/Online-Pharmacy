package com.pharmacy.orders.controller;

import com.pharmacy.common.api.ApiPaginatedResponse;
import com.pharmacy.common.api.ApiResponse;
import com.pharmacy.orders.dto.*;
import com.pharmacy.orders.security.JwtUserPrincipal;
import com.pharmacy.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Validated
@Tag(name = "Orders", description = "Order and Cart Management APIs")
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/cart")
    @Operation(summary = "Get cart", description = "Returns the current user's cart")
    public ResponseEntity<ApiResponse<CartDTO>> getCart(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.of(orderService.getCart(principal.getUserId())));
    }

    @PostMapping("/cart/items")
    @Operation(summary = "Add to cart", description = "Adds an item to the cart")
    public ResponseEntity<ApiResponse<CartDTO>> addToCart(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(orderService.addToCart(principal.getUserId(), request)));
    }

    @PutMapping("/cart/items/{itemId}")
    @Operation(summary = "Update cart item", description = "Updates item quantity in cart")
    public ResponseEntity<ApiResponse<CartDTO>> updateCartItem(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long itemId,
            @RequestParam @NotNull @Min(0) Integer quantity) {
        return ResponseEntity.ok(ApiResponse.of(orderService.updateCartItem(principal.getUserId(), itemId, quantity)));
    }

    @DeleteMapping("/cart/items/{itemId}")
    @Operation(summary = "Remove from cart", description = "Removes an item from the cart")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long itemId) {
        orderService.removeFromCart(principal.getUserId(), itemId);
        return ResponseEntity.ok(ApiResponse.of(null, "Item removed from cart"));
    }

    @DeleteMapping("/cart")
    @Operation(summary = "Clear cart", description = "Removes all items from the cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal JwtUserPrincipal principal) {
        orderService.clearCart(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.of(null, "Cart cleared"));
    }

    @PostMapping("/checkout/start")
    @Operation(summary = "Start checkout", description = "Initiates the checkout process")
    public ResponseEntity<ApiResponse<OrderDTO>> startCheckout(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(ApiResponse.of(orderService.startCheckout(principal.getUserId(), request)));
    }

    @PostMapping("/checkout/payment")
    @Operation(summary = "Initiate payment", description = "Starts the payment process")
    public ResponseEntity<ApiResponse<OrderDTO>> initiatePayment(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam Long orderId,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.of(orderService.initiatePayment(principal.getUserId(), orderId, request)));
    }

    @PostMapping("/checkout/confirm")
    @Operation(summary = "Confirm payment", description = "Confirms payment and places the order")
    public ResponseEntity<ApiResponse<OrderDTO>> confirmPayment(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestParam Long orderId,
            @RequestParam(required = false) String transactionId) {
        String txId = transactionId != null ? transactionId : "TXN-" + System.currentTimeMillis();
        return ResponseEntity.ok(ApiResponse.of(orderService.confirmPayment(principal.getUserId(), orderId, txId)));
    }

    @GetMapping
    @Operation(summary = "Get user orders", description = "Returns all orders for the current user")
    public ResponseEntity<ApiPaginatedResponse<List<OrderDTO>>> getUserOrders(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            Pageable pageable) {
        Page<OrderDTO> orders = orderService.getUserOrders(principal.getUserId(), pageable);
        return ResponseEntity.ok(ApiPaginatedResponse.of(orders.getContent(), orders));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details", description = "Returns details of a specific order")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrder(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.of(orderService.getOrderById(principal.getUserId(), orderId)));
    }

    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel order", description = "Cancels an order")
    public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.of(orderService.cancelOrder(principal.getUserId(), orderId)));
    }

    @PutMapping("/{orderId}/payment")
    @Operation(summary = "Update payment status", description = "Admin can update payment status")
    public ResponseEntity<ApiResponse<OrderDTO>> updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.of(orderService.updatePaymentStatus(orderId, status)));
    }

    @PutMapping("/{orderId}/status")
    @Operation(summary = "Update order status", description = "Admin can update order status")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.of(orderService.updateOrderStatus(orderId, status)));
    }
}