package com.expensetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BudgetRequest(
        @NotNull(message = "Budget amount is required")
        @DecimalMin(value = "0.01", message = "Budget must be greater than zero")
        BigDecimal amount
) {
}
