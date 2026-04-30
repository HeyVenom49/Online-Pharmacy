package com.pharmacy.orders.converter;

import com.pharmacy.common.enums.OrderStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class OrderStatusConverter implements AttributeConverter<OrderStatus, String> {
    
    @Override
    public String convertToDatabaseColumn(OrderStatus status) {
        if (status == null) {
            return "CHECKOUT_STARTED";
        }
        return status.name();
    }
    
    @Override
    public OrderStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return OrderStatus.CHECKOUT_STARTED;
        }
        return OrderStatus.valueOf(dbData);
    }
}