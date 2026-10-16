package com.expensetracker.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "app_budget")
public class Budget {
    @Id
    private Long id = 1L;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    public Budget() {
    }

    public Budget(Long id, BigDecimal amount) {
        this.id = id;
        this.amount = amount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
