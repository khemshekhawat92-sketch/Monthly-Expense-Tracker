package com.expensetracker.dto;

import java.math.BigDecimal;
import java.util.Map;

public record MonthlySummary(
        String month,
        BigDecimal budget,
        BigDecimal totalSpent,
        BigDecimal remaining,
        BigDecimal budgetUsedPercent,
        Map<String, BigDecimal> categoryTotals
) {
}
