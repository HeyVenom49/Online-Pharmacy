package com.pharmacy.orders.repository;

import com.pharmacy.orders.entity.Order;
import com.pharmacy.common.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.payment ORDER BY o.orderedAt DESC")
    List<Order> findByUserIdOrderByOrderedAtDesc(Long userId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.payment ORDER BY o.orderedAt DESC")
    Page<Order> findByUserIdOrderByOrderedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.payment WHERE o.status = :status")
    List<Order> findByStatus(OrderStatus status);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.payment WHERE o.status = :status")
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.payment")
    List<Order> findAll();

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.payment")
    Page<Order> findAll(Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.payment WHERE o.id = :id")
    Optional<Order> findByIdWithPayment(@Param("id") Long id);

    long countByStatus(OrderStatus status);
}
