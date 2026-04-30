package com.pharmacy.common.feign;

public class PaymentSummary {
    private Long id;
    private String status;
    private String paymentMethod;
    private String transactionId;
    private Double amount;
    private java.time.LocalDateTime paidAt;

    public PaymentSummary() {}

    public PaymentSummary(Long id, String status, String paymentMethod, String transactionId, Double amount, java.time.LocalDateTime paidAt) {
        this.id = id;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
        this.amount = amount;
        this.paidAt = paidAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String status;
        private String paymentMethod;
        private String transactionId;
        private Double amount;
        private java.time.LocalDateTime paidAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public Builder transactionId(String transactionId) { this.transactionId = transactionId; return this; }
        public Builder amount(Double amount) { this.amount = amount; return this; }
        public Builder paidAt(java.time.LocalDateTime paidAt) { this.paidAt = paidAt; return this; }
        public PaymentSummary build() { return new PaymentSummary(id, status, paymentMethod, transactionId, amount, paidAt); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public java.time.LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(java.time.LocalDateTime paidAt) { this.paidAt = paidAt; }
}
