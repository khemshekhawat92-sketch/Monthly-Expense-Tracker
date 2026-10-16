package com.expensetracker.controller;

import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.dto.MonthlySummary;
import com.expensetracker.model.Expense;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ExpenseController {
    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping("/expenses")
    public List<Expense> getExpenses(@RequestParam(required = false) String month) {
        return expenseService.getExpenses(month);
    }

    @PostMapping("/expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public Expense addExpense(@Valid @RequestBody ExpenseRequest request) {
        return expenseService.addExpense(request);
    }

    @DeleteMapping("/expenses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
    }

    @GetMapping("/budget")
    public Map<String, Object> getBudget() {
        return expenseService.getBudget();
    }

    @PutMapping("/budget")
    public Map<String, Object> setBudget(@Valid @RequestBody BudgetRequest request) {
        return expenseService.setBudget(request);
    }

    @GetMapping("/summary")
    public MonthlySummary getSummary(@RequestParam(required = false) String month) {
        return expenseService.getSummary(month);
    }
}
