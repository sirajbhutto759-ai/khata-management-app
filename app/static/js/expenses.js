/* ==========================================================================
   Khata Management & Accounting App - Expense Management Module
   ========================================================================== */

let currentExpenseCategory = "all";
let currentExpenseList = [];

async function renderExpensesView() {
  const container = document.getElementById("main-content-view");
  if (!container) return;

  container.innerHTML = `
    <!-- Top Action Header -->
    <div class="action-banner">
      <div>
        <h3 style="font-weight: 700; font-size: 1.25rem;">${t('expenses')}</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${t('expenseTitle')} &amp; ${t('category')}</p>
      </div>

      <button class="btn btn-primary" onclick="openAddExpenseModal()">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
        ${t('addExpense')}
      </button>
    </div>

    <!-- Summary KPI Cards -->
    <div class="grid-4">
      <div class="metric-card">
        <div class="metric-icon expense"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2"></path></svg></div>
        <div class="metric-details">
          <p>${t('dailyExpenses')}</p>
          <h3 id="exp-summary-daily">DKB 0.00</h3>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon expense"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
        <div class="metric-details">
          <p>${t('weeklyExpenses')}</p>
          <h3 id="exp-summary-weekly">DKB 0.00</h3>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon expense"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></div>
        <div class="metric-details">
          <p>${t('monthlyExpenses')}</p>
          <h3 id="exp-summary-monthly">DKB 0.00</h3>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon expense"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z"></path></svg></div>
        <div class="metric-details">
          <p>${t('totalExpenses')}</p>
          <h3 id="exp-summary-total">DKB 0.00</h3>
        </div>
      </div>
    </div>

    <!-- Expenses List Table -->
    <div class="table-card">
      <div class="table-header">
        <h4 style="font-weight: 700;">${t('expenses')}</h4>
        <div style="width: 200px;">
          <select id="exp-category-filter" class="form-control" onchange="fetchExpensesList()">
            <option value="all">All Categories</option>
            <option value="Rent">Rent</option>
            <option value="Electricity">Electricity</option>
            <option value="Salary">Salary</option>
            <option value="Transport">Transport</option>
            <option value="Food">Food</option>
            <option value="Internet">Internet</option>
            <option value="Purchases">Purchases</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>${t('date')}</th>
              <th>${t('expenseTitle')}</th>
              <th>${t('category')}</th>
              <th>${t('paymentMethod')}</th>
              <th>${t('amount')}</th>
              <th>${t('actions')}</th>
            </tr>
          </thead>
          <tbody id="expense-table-body">
            <tr><td colspan="6" style="text-align: center;">Loading expenses...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  fetchExpenseSummary();
  fetchExpensesList();
}

async function fetchExpenseSummary() {
  try {
    const s = await apiRequest("/api/expenses/summary");
    document.getElementById("exp-summary-daily").textContent = `DKB ${s.daily.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById("exp-summary-weekly").textContent = `DKB ${s.weekly.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById("exp-summary-monthly").textContent = `DKB ${s.monthly.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById("exp-summary-total").textContent = `DKB ${s.total.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  } catch (err) {}
}

async function fetchExpensesList() {
  try {
    const cat = document.getElementById("exp-category-filter") ? document.getElementById("exp-category-filter").value : "all";
    const expenses = await apiRequest(`/api/expenses?category_name=${cat}`);
    currentExpenseList = expenses;
    const tbody = document.getElementById("expense-table-body");
    if (!tbody) return;

    if (expenses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">${t('noDataFound')}</td></tr>`;
      return;
    }

    tbody.innerHTML = expenses.map(e => `
      <tr>
        <td>${e.date}</td>
        <td><strong>${escapeHtml(e.title)}</strong>${e.description ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(e.description)}</div>` : ''}</td>
        <td><span class="type-badge expense">${e.category_name}</span></td>
        <td>${e.payment_method}</td>
        <td style="font-weight: 700; color: var(--accent-blue);">DKB ${e.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td>
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <button class="btn btn-sm btn-outline" onclick="openEditExpenseModal(${e.id})">${t('editCustomer')}</button>
            <button class="btn btn-sm btn-outline" style="color: var(--accent-red);" onclick="confirmDeleteExpense(${e.id})">${t('deleteExpense')}</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch (err) {}
}

/* Modals */
function openAddExpenseModal() {
  const modal = document.getElementById("modal-expense");
  document.querySelector("#modal-expense h3").textContent = t("addExpense");
  document.getElementById("exp-title").value = "";
  document.getElementById("exp-category").value = "Rent";
  document.getElementById("exp-amount").value = "";
  document.getElementById("exp-date").value = new Date().toISOString().split('T')[0];
  document.getElementById("exp-payment-method").value = "Cash";
  document.getElementById("exp-description").value = "";

  // Clear edit id
  const hiddenId = document.getElementById("exp-edit-id");
  if (hiddenId) hiddenId.value = "";

  if (modal) modal.classList.add("active");
}

function openEditExpenseModal(id) {
  const exp = currentExpenseList.find(e => e.id === id);
  if (!exp) return;

  const modal = document.getElementById("modal-expense");
  document.querySelector("#modal-expense h3").textContent = t("editExpense");
  document.getElementById("exp-title").value = exp.title;
  document.getElementById("exp-category").value = exp.category_name;
  document.getElementById("exp-amount").value = exp.amount;
  document.getElementById("exp-date").value = exp.date;
  document.getElementById("exp-payment-method").value = exp.payment_method || "Cash";
  document.getElementById("exp-description").value = exp.description || "";

  // Set hidden edit id
  let hiddenId = document.getElementById("exp-edit-id");
  if (!hiddenId) {
    hiddenId = document.createElement("input");
    hiddenId.type = "hidden";
    hiddenId.id = "exp-edit-id";
    document.getElementById("modal-expense").querySelector("form").appendChild(hiddenId);
  }
  hiddenId.value = id;

  if (modal) modal.classList.add("active");
}

async function handleSaveExpense(e) {
  e.preventDefault();
  const editId = document.getElementById("exp-edit-id") ? document.getElementById("exp-edit-id").value : "";
  const title = document.getElementById("exp-title").value.trim();
  const category_name = document.getElementById("exp-category").value;
  const amount = parseFloat(document.getElementById("exp-amount").value);
  const date = document.getElementById("exp-date").value;
  const payment_method = document.getElementById("exp-payment-method").value;
  const description = document.getElementById("exp-description").value.trim();

  if (!title || !amount || amount <= 0) {
    showToast("Please provide valid expense title and amount", "error");
    return;
  }

  try {
    if (editId) {
      await apiRequest(`/api/expenses/${editId}`, "PUT", {
        title, category_name, amount, date, payment_method, description
      });
      showToast("Expense updated successfully!", "success");
    } else {
      await apiRequest("/api/expenses", "POST", {
        title, category_name, amount, date, payment_method, description
      });
      showToast("Expense recorded successfully!", "success");
    }
    closeModal("modal-expense");
    renderExpensesView();
  } catch (err) {}
}

function confirmDeleteExpense(id) {
  showConfirmDialog(
    t("deleteExpense"),
    t("confirmDeleteExpense"),
    async () => {
      try {
        await apiRequest(`/api/expenses/${id}`, "DELETE");
        showToast("Expense deleted successfully", "success");
        renderExpensesView();
      } catch (err) {}
    }
  );
}
