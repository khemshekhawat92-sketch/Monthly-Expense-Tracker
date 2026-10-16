const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const monthFilter = document.getElementById("monthFilter");
const expenseForm = document.getElementById("expenseForm");
const budgetForm = document.getElementById("budgetForm");
const notice = document.getElementById("notice");
const expenseRows = document.getElementById("expenseRows");
const categoryBreakdown = document.getElementById("categoryBreakdown");

function localMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function formatMoney(value) {
  return money.format(Number(value || 0));
}
function showNotice(message, type = "success") {
  notice.textContent = message;
  notice.className = `notice ${type}`;
  notice.hidden = false;
  window.clearTimeout(showNotice.timeoutId);
  showNotice.timeoutId = window.setTimeout(() => { notice.hidden = true; }, 4500);
}
async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch (_) { /* The response may have no JSON body. */ }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}
function addCell(row, text, className) {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  row.appendChild(cell);
  return cell;
}
function renderExpenses(expenses) {
  expenseRows.replaceChildren();
  document.getElementById("expenseCount").textContent =
    `${expenses.length} ${expenses.length === 1 ? "record" : "records"}`;

  if (!expenses.length) {
    const row = document.createElement("tr");
    const cell = addCell(row, "No expenses for this month yet. Add your first expense to get started.", "empty-state");
    cell.colSpan = 5;
    expenseRows.appendChild(row);
    return;
  }

  for (const expense of expenses) {
    const row = document.createElement("tr");
    addCell(row, expense.title);
    const categoryCell = document.createElement("td");
    const tag = document.createElement("span");
    tag.className = "category-tag";
    tag.textContent = expense.category;
    categoryCell.appendChild(tag);
    row.appendChild(categoryCell);
    addCell(row, expense.date);
    addCell(row, formatMoney(expense.amount), "amount-cell");

    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "delete-button";
    button.textContent = "Delete";
    button.setAttribute("aria-label", `Delete ${expense.title}`);
    button.addEventListener("click", async () => {
      if (!window.confirm(`Delete "${expense.title}"?`)) return;
      try {
        await api(`/api/expenses/${expense.id}`, { method: "DELETE" });
        showNotice("Expense deleted.");
        await refreshDashboard();
      } catch (error) {
        showNotice(error.message, "error");
      }
    });
    actionCell.appendChild(button);
    row.appendChild(actionCell);
    expenseRows.appendChild(row);
  }
}
function renderSummary(summary) {
  document.getElementById("budgetValue").textContent = formatMoney(summary.budget);
  document.getElementById("spentValue").textContent = formatMoney(summary.totalSpent);
  document.getElementById("remainingValue").textContent = formatMoney(summary.remaining);
  document.getElementById("spentNote").textContent = `For ${summary.month}`;
  const hasBudget = Number(summary.budget) > 0;
  const used = Number(summary.budgetUsedPercent || 0);
  const remaining = Number(summary.remaining || 0);
  document.getElementById("remainingNote").textContent = !hasBudget
    ? "Set a budget to track your balance"
    : remaining < 0 ? "You are over your budget" : "Available within your budget";

  const displayPercent = hasBudget ? Math.max(0, used) : 0;
  document.getElementById("progressPercent").textContent = hasBudget ? `${used.toFixed(1)}%` : "0%";
  document.getElementById("progressText").textContent = !hasBudget
    ? "Set a budget to track your progress."
    : used > 100 ? "You have exceeded your monthly budget."
    : used >= 80 ? "Careful — you have used at least 80% of your budget."
    : "You are tracking within your monthly budget.";
  const bar = document.getElementById("progressBar");
  bar.style.width = `${Math.min(100, displayPercent)}%`;
  bar.classList.toggle("over", used > 100);
  document.getElementById("budgetAmount").value = hasBudget ? Number(summary.budget) : "";

  const totals = summary.categoryTotals || {};
  const entries = Object.entries(totals).sort((a, b) => Number(b[1]) - Number(a[1]));
  document.getElementById("categoryMonth").textContent = summary.month;
  categoryBreakdown.replaceChildren();
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No category spending recorded for this month.";
    categoryBreakdown.appendChild(empty);
    return;
  }
  const maxAmount = Math.max(...entries.map(([, amount]) => Number(amount)));
  for (const [category, amount] of entries) {
    const item = document.createElement("div");
    item.className = "category-item";
    const top = document.createElement("div");
    top.className = "category-item-top";
    const name = document.createElement("strong");
    name.textContent = category;
    const value = document.createElement("span");
    value.textContent = formatMoney(amount);
    top.append(name, value);
    const track = document.createElement("div");
    track.className = "mini-track";
    const fill = document.createElement("span");
    fill.style.width = `${maxAmount > 0 ? Number(amount) / maxAmount * 100 : 0}%`;
    track.appendChild(fill);
    item.append(top, track);
    categoryBreakdown.appendChild(item);
  }
}
async function refreshDashboard() {
  const month = monthFilter.value || localMonth();
  const [expenses, summary] = await Promise.all([
    api(`/api/expenses?month=${encodeURIComponent(month)}`),
    api(`/api/summary?month=${encodeURIComponent(month)}`)
  ]);
  renderExpenses(expenses);
  renderSummary(summary);
}
expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    title: document.getElementById("title").value.trim(),
    category: document.getElementById("category").value,
    amount: Number(document.getElementById("amount").value),
    date: document.getElementById("date").value
  };
  try {
    await api("/api/expenses", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    expenseForm.reset();
    document.getElementById("date").value = localDate();
    monthFilter.value = payload.date.slice(0, 7);
    showNotice("Expense added successfully.");
    await refreshDashboard();
  } catch (error) {
    showNotice(error.message, "error");
  }
});
budgetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const amount = Number(document.getElementById("budgetAmount").value);
  try {
    await api("/api/budget", {
      method: "PUT",
      body: JSON.stringify({ amount })
    });
    showNotice("Monthly budget saved.");
    await refreshDashboard();
  } catch (error) {
    showNotice(error.message, "error");
  }
});
monthFilter.addEventListener("change", async () => {
  try {
    await refreshDashboard();
  } catch (error) {
    showNotice(error.message, "error");
  }
});

async function startApp() {
  monthFilter.value = localMonth();
  document.getElementById("date").value = localDate();
  try {
    await refreshDashboard();
  } catch (error) {
    showNotice(`Could not connect to the backend: ${error.message}`, "error");
    expenseRows.replaceChildren();
    const row = document.createElement("tr");
    const cell = addCell(row, "Start the Spring Boot backend and refresh this page.", "empty-state");
    cell.colSpan = 5;
    expenseRows.appendChild(row);
  }
}
startApp();
