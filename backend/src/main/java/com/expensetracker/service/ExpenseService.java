package com.expensetracker.service;

import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.dto.MonthlySummary;
import com.expensetracker.model.Budget;
import com.expensetracker.model.Expense;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@Transactional
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public ExpenseService(ExpenseRepository expenseRepository, BudgetRepository budgetRepository) {
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpenses(String monthText) {
        if (monthText == null || monthText.isBlank()) {
            return expenseRepository.findAllByOrderByDateDescIdDesc();
        }
        YearMonth month = parseMonth(monthText);
        return expenseRepository.findByDateBetweenOrderByDateDescIdDesc(
                month.atDay(1), month.atEndOfMonth());
    }

    public Expense addExpense(ExpenseRequest request) {
        String title = request.title().trim();
        String category = request.category().trim();
        if (title.isEmpty() || category.isEmpty()) {
            throw new IllegalArgumentException("Title and category cannot be blank.");
        }
        return expenseRepository.save(new Expense(
                title, category, request.amount().setScale(2, RoundingMode.HALF_UP), request.date()));
    }

    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new EntityNotFoundException("Expense " + id + " was not found.");
        }
        expenseRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBudget() {
        BigDecimal amount = budgetRepository.findById(1L)
                .map(Budget::getAmount).orElse(BigDecimal.ZERO);
        return Map.of("amount", amount);
    }

    public Map<String, Object> setBudget(BudgetRequest request) {
        BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_UP);
        Budget budget = budgetRepository.findById(1L)
                .orElse(new Budget(1L, BigDecimal.ZERO));
        budget.setAmount(amount);
        budgetRepository.save(budget);
        return Map.of("amount", amount);
    }

    @Transactional(readOnly = true)
    public MonthlySummary getSummary(String monthText) {
        YearMonth month = (monthText == null || monthText.isBlank())
                ? YearMonth.now() : parseMonth(monthText);

        List<Expense> monthExpenses = expenseRepository.findByDateBetween(
                month.atDay(1), month.atEndOfMonth());

        BigDecimal total = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryTotals = new TreeMap<>();
        for (Expense expense : monthExpenses) {
            total = total.add(expense.getAmount());
            categoryTotals.merge(expense.getCategory(), expense.getAmount(), BigDecimal::add);
        }

        BigDecimal budget = budgetRepository.findById(1L)
                .map(Budget::getAmount).orElse(BigDecimal.ZERO);
        BigDecimal remaining = budget.subtract(total);
        BigDecimal used = BigDecimal.ZERO;
        if (budget.compareTo(BigDecimal.ZERO) > 0) {
            used = total.multiply(BigDecimal.valueOf(100))
                    .divide(budget, 2, RoundingMode.HALF_UP);
        }

        return new MonthlySummary(month.toString(), budget, total, remaining, used, categoryTotals);
    }

    private YearMonth parseMonth(String text) {
        try {
            return YearMonth.parse(text);
        } catch (RuntimeException ex) {
            throw new IllegalArgumentException("Month must use YYYY-MM format.");
        }
    }
}
