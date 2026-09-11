/* ==========================================================================
   Khata Management & Accounting App - Transactions & Udhaar Manager
   ========================================================================== */

let currentTxFilterType = "all";
let currentTxPaymentMethod = "all";
let currentTxList = [];
let txSearchDebounce = null;

async function renderTransactionsView() {
  const container = document.getElementById("main-content-view");
  if (!container) return;

  container.innerHTML = `
    <!-- Top Action Header -->
    <div class="action-banner">
      <div>
        <h3 style="font-weight: 700; font-size: 1.25rem;">${t('transactions')}</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${t('creditType')} &amp; ${t('debitType')}</p>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn btn-danger" onclick="openAddTxModal('credit')">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
          ${t('giveCredit')}
        </button>

        <button class="btn btn-success" onclick="openAddTxModal('debit')">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14"></path></svg>
          ${t('receivePayment')}
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="table-card" style="padding: 1rem; margin-bottom: 1.25rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-sm ${currentTxFilterType === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="setTxTypeFilter('all')">${t('filterAll')}</button>
          <button class="btn btn-sm ${currentTxFilterType === 'credit' ? 'btn-primary' : 'btn-outline'}" onclick="setTxTypeFilter('credit')">${t('creditType')}</button>
          <button class="btn btn-sm ${currentTxFilterType === 'debit' ? 'btn-primary' : 'btn-outline'}" onclick="setTxTypeFilter('debit')">${t('debitType')}</button>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <select id="tx-paymethod-filter" class="form-control" style="width: 160px;" onchange="fetchTransactionsList()">
            <option value="all">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="JazzCash">JazzCash</option>
            <option value="Easypaisa">Easypaisa</option>
            <option value="NayaPay">NayaPay</option>
            <option value="Other">Other</option>
          </select>

          <input type="text" id="tx-search-input" class="form-control" style="width: 220px;" placeholder="${t('searchPlaceholder')}" oninput="debouncedTxSearch()">
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="table-card">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>${t('date')}</th>
              <th>${t('customerName')}</th>
              <th>${t('txType')}</th>
              <th>${t('paymentMethod')}</th>
              <th>${t('amount')}</th>
              <th>${t('description')}</th>
              <th>${t('receipt')}</th>
              <th>${t('actions')}</th>
            </tr>
          </thead>
          <tbody id="tx-table-body">
            <tr><td colspan="8" style="text-align: center;">Loading transactions...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  fetchTransactionsList();
}

function debouncedTxSearch() {
  clearTimeout(txSearchDebounce);
  txSearchDebounce = setTimeout(() => fetchTransactionsList(), 350);
}

async function fetchTransactionsList() {
  try {
    const payMethod = document.getElementById("tx-paymethod-filter") ? document.getElementById("tx-paymethod-filter").value : "all";
    const search = document.getElementById("tx-search-input") ? document.getElementById("tx-search-input").value.trim() : "";

    let url = `/api/transactions?type=${currentTxFilterType}&payment_method=${payMethod}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const txs = await apiRequest(url);
    currentTxList = txs;
    const tbody = document.getElementById("tx-table-body");
    if (!tbody) return;

    if (txs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">${t('noDataFound')}</td></tr>`;
      return;
    }

    tbody.innerHTML = txs.map(tx => {
      let badgeClass = tx.type === 'credit' ? 'credit' : (tx.type === 'debit' ? 'debit' : 'expense');
      let typeName = tx.type === 'credit' ? TRANSLATIONS[currentLang].creditType : (tx.type === 'debit' ? TRANSLATIONS[currentLang].debitType : tx.type);
      let amtColor = tx.type === 'credit' ? 'var(--accent-red)' : 'var(--accent-green)';
      let amtPrefix = tx.type === 'credit' ? '+' : '-';
      let receiptHtml = tx.receipt_path ? `
        <a href="${tx.receipt_path}" target="_blank" class="btn btn-sm btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; color: var(--primary); display: inline-flex; align-items: center; gap: 0.25rem;">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
          ${t('receipt')}
        </a>` : `<span style="color: var(--text-muted); font-size: 0.8rem;">-</span>`;

      return `
        <tr>
          <td>${tx.date}</td>
          <td><strong>${escapeHtml(tx.customer_name || 'N/A')}</strong></td>
          <td><span class="type-badge ${badgeClass}">${typeName}</span></td>
          <td>${tx.payment_method}</td>
          <td style="font-weight: 700; color: ${amtColor}">${amtPrefix} DKB ${tx.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
          <td>${escapeHtml(tx.description || '-')}</td>
          <td>${receiptHtml}</td>
          <td>
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
              <button class="btn btn-sm btn-outline" onclick="openEditTxModal(${tx.id})">${t('editCustomer')}</button>
              <button class="btn btn-sm btn-outline" style="color: var(--accent-red);" onclick="confirmDeleteTx(${tx.id})">${t('deleteTransaction')}</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Fetch Tx List Error:", err);
  }
}

function setTxTypeFilter(type) {
  currentTxFilterType = type;
  renderTransactionsView();
}

/* Modals */
async function openAddTxModal(defaultType = "credit", customerId = null) {
  const modal = document.getElementById("modal-tx");
  document.getElementById("modal-tx-title").textContent = t("addTransaction");
  document.getElementById("tx-type").value = defaultType;
  document.getElementById("tx-amount").value = "";
  document.getElementById("tx-description").value = "";
  document.getElementById("tx-date").value = new Date().toISOString().split('T')[0];
  document.getElementById("tx-payment-method").value = "Cash";
  const receiptInput = document.getElementById("tx-receipt-file");
  if (receiptInput) receiptInput.value = "";

  // Clear hidden edit id
  const hiddenId = document.getElementById("tx-edit-id");
  if (hiddenId) hiddenId.value = "";

  // Populate Customers Dropdown
  const custSelect = document.getElementById("tx-customer-id");
  custSelect.innerHTML = `<option value="">-- Select Customer --</option>`;
  custSelect.disabled = false;

  try {
    const customers = await apiRequest("/api/customers");
    customers.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.phone || 'No phone'}) - Bal: DKB ${c.current_balance.toFixed(2)}`;
      if (customerId && c.id === customerId) opt.selected = true;
      custSelect.appendChild(opt);
    });
  } catch (err) {}

  if (modal) modal.classList.add("active");
}

async function openEditTxModal(id) {
  const tx = currentTxList.find(tx => tx.id === id);
  if (!tx) return;

  const modal = document.getElementById("modal-tx");
  document.getElementById("modal-tx-title").textContent = t("editTransaction");
  document.getElementById("tx-type").value = tx.type;
  document.getElementById("tx-amount").value = tx.amount;
  document.getElementById("tx-description").value = tx.description || "";
  document.getElementById("tx-date").value = tx.date;
  document.getElementById("tx-payment-method").value = tx.payment_method || "Cash";

  // Set hidden edit id
  let hiddenId = document.getElementById("tx-edit-id");
  if (!hiddenId) {
    hiddenId = document.createElement("input");
    hiddenId.type = "hidden";
    hiddenId.id = "tx-edit-id";
    document.getElementById("modal-tx").querySelector("form").appendChild(hiddenId);
  }
  hiddenId.value = id;

  // Populate Customers Dropdown
  const custSelect = document.getElementById("tx-customer-id");
  custSelect.innerHTML = `<option value="">-- Select Customer --</option>`;
  custSelect.disabled = false;

  try {
    const customers = await apiRequest("/api/customers");
    customers.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.phone || 'No phone'})`;
      if (tx.customer_id && c.id === tx.customer_id) opt.selected = true;
      custSelect.appendChild(opt);
    });
  } catch (err) {}

  if (modal) modal.classList.add("active");
}

async function handleSaveTransaction(e) {
  e.preventDefault();
  const editId = document.getElementById("tx-edit-id") ? document.getElementById("tx-edit-id").value : "";
  const customer_id = parseInt(document.getElementById("tx-customer-id").value);
  const type = document.getElementById("tx-type").value;
  const amount = parseFloat(document.getElementById("tx-amount").value);
  const date = document.getElementById("tx-date").value;
  const payment_method = document.getElementById("tx-payment-method").value;
  const description = document.getElementById("tx-description").value.trim();

  if (!customer_id) {
    showToast("Please select a customer", "error");
    return;
  }
  if (!amount || amount <= 0) {
    showToast("Please enter a valid amount", "error");
    return;
  }

  try {
    if (editId) {
      // Update existing transaction
      await apiRequest(`/api/transactions/${editId}`, "PUT", {
        customer_id, type, amount, date, payment_method, description
      });
      showToast("Transaction updated successfully!", "success");
    } else {
      // Upload receipt if present
      let receipt_path = null;
      const receiptFile = document.getElementById("tx-receipt-file");
      if (receiptFile && receiptFile.files.length > 0) {
        const formData = new FormData();
        formData.append("file", receiptFile.files[0]);
        const uploadRes = await apiRequest("/api/transactions/receipt-upload", "POST", formData, true);
        receipt_path = uploadRes.receipt_url;
      }

      await apiRequest("/api/transactions", "POST", {
        customer_id, type, amount, date, payment_method, description, receipt_path
      });
      showToast("Transaction saved successfully!", "success");
      if (receiptFile) receiptFile.value = "";
    }

    closeModal("modal-tx");
    if (window.currentTab === "transactions") fetchTransactionsList();
    else if (window.currentTab === "dashboard") renderDashboard();
    else if (window.currentTab === "customers") fetchCustomers();
  } catch (err) {}
}

function confirmDeleteTx(id) {
  showConfirmDialog(
    t("deleteTransaction"),
    t("confirmDeleteTransaction"),
    async () => {
      try {
        await apiRequest(`/api/transactions/${id}`, "DELETE");
        showToast("Transaction deleted successfully", "success");
        fetchTransactionsList();
      } catch (err) {}
    }
  );
}
