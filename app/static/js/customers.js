/* ==========================================================================
   Khata Management & Accounting App - Customer Module & Ledger Statement
   ========================================================================== */

let currentCustomerFilter = "all";
let currentCustomerList = [];

async function renderCustomersView() {
  const container = document.getElementById("main-content-view");
  if (!container) return;

  container.innerHTML = `
    <!-- Top Action Header -->
    <div class="action-banner">
      <div>
        <h3 style="font-weight: 700; font-size: 1.25rem;">${t('customers')}</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${t('customerName')} & ${t('currentBalance')}</p>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn btn-primary" onclick="openAddCustomerModal()">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"></path></svg>
          ${t('addCustomer')}
        </button>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="table-card" style="padding: 1rem; margin-bottom: 1.25rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
        
        <!-- Filter Pills -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-sm ${currentCustomerFilter === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="filterCustomers('all')">${t('filterAll')}</button>
          <button class="btn btn-sm ${currentCustomerFilter === 'debtor' ? 'btn-primary' : 'btn-outline'}" onclick="filterCustomers('debtor')">${t('filterReceivable')}</button>
          <button class="btn btn-sm ${currentCustomerFilter === 'creditor' ? 'btn-primary' : 'btn-outline'}" onclick="filterCustomers('creditor')">${t('filterPayable')}</button>
          <button class="btn btn-sm ${currentCustomerFilter === 'zero' ? 'btn-primary' : 'btn-outline'}" onclick="filterCustomers('zero')">${t('filterZero')}</button>
        </div>

        <!-- Search Input -->
        <div style="position: relative; width: 280px;">
          <input type="text" id="customer-search-input" class="form-control" placeholder="${t('searchCustomerPlaceholder')}" oninput="searchCustomers(this.value)">
        </div>
      </div>
    </div>

    <!-- Customers Table -->
    <div class="table-card">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>${t('customerName')}</th>
              <th>${t('phoneLabel')}</th>
              <th>${t('openingBalance')}</th>
              <th>${t('currentBalance')}</th>
              <th>${t('actions')}</th>
            </tr>
          </thead>
          <tbody id="customers-table-body">
            <tr><td colspan="5" style="text-align: center;">Loading customers...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  fetchCustomers();
}

async function fetchCustomers(search = "") {
  try {
    let url = `/api/customers?filter_type=${currentCustomerFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    currentCustomerList = await apiRequest(url);
    const tbody = document.getElementById("customers-table-body");
    if (!tbody) return;

    if (currentCustomerList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">${t('noDataFound')}</td></tr>`;
      return;
    }

    tbody.innerHTML = currentCustomerList.map(c => {
      let balColor = c.current_balance > 0 ? 'var(--accent-red)' : (c.current_balance < 0 ? 'var(--accent-amber)' : 'var(--text-muted)');
      let balText = c.current_balance > 0 ? `+ DKB ${c.current_balance.toLocaleString('en-US', {minimumFractionDigits: 2})}` : `DKB ${c.current_balance.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

      return `
        <tr>
          <td>
            <strong>${escapeHtml(c.name)}</strong>
            ${c.address ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(c.address)}</div>` : ''}
          </td>
          <td>${escapeHtml(c.phone || '-')}</td>
          <td>DKB ${c.opening_balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
          <td style="font-weight: 700; color: ${balColor}">${balText}</td>
          <td>
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
              <button class="btn btn-sm btn-primary" onclick="openCustomerStatementModal(${c.id})">${t('viewStatement')}</button>
              <button class="btn btn-sm btn-success" onclick="openAddTxModal('debit', ${c.id})">${t('receivePayment')}</button>
              <button class="btn btn-sm btn-danger" onclick="openAddTxModal('credit', ${c.id})">${t('giveCredit')}</button>
              ${c.current_balance > 0 && c.phone ? `<button class="btn btn-sm" style="background: #25D366; color: white; border: none;" onclick="sendWhatsAppReminder('${escapeHtml(c.phone)}', '${escapeHtml(c.name)}', ${c.current_balance})" title="Send WhatsApp Reminder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              </button>` : ''}
              <button class="btn btn-sm btn-outline" onclick="openEditCustomerModal(${c.id})">${t('editCustomer')}</button>
              <button class="btn btn-sm btn-outline" style="color: var(--accent-red);" onclick="confirmDeleteCustomer(${c.id}, '${escapeHtml(c.name)}')">${t('deleteCustomer')}</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Fetch Customers Error:", err);
  }
}

function filterCustomers(type) {
  currentCustomerFilter = type;
  renderCustomersView();
}

function searchCustomers(query) {
  fetchCustomers(query);
}

/* Modals */
function openAddCustomerModal() {
  const modal = document.getElementById("modal-customer");
  document.getElementById("modal-customer-title").textContent = t("addCustomer");
  document.getElementById("customer-id").value = "";
  document.getElementById("customer-name").value = "";
  document.getElementById("customer-phone").value = "";
  document.getElementById("customer-address").value = "";
  document.getElementById("customer-opening-balance").value = "0";
  document.getElementById("customer-opening-balance").disabled = false; // Re-enable for new customer
  document.getElementById("customer-notes").value = "";

  if (modal) modal.classList.add("active");
}

function openEditCustomerModal(id) {
  const customer = currentCustomerList.find(c => c.id === id);
  if (!customer) return;

  const modal = document.getElementById("modal-customer");
  document.getElementById("modal-customer-title").textContent = t("editCustomer");
  document.getElementById("customer-id").value = customer.id;
  document.getElementById("customer-name").value = customer.name;
  document.getElementById("customer-phone").value = customer.phone || "";
  document.getElementById("customer-address").value = customer.address || "";
  document.getElementById("customer-opening-balance").value = customer.opening_balance;
  document.getElementById("customer-opening-balance").disabled = true; // Opening balance immutable on edit
  document.getElementById("customer-notes").value = customer.notes || "";

  if (modal) modal.classList.add("active");
}

async function handleSaveCustomer(e) {
  e.preventDefault();
  const id = document.getElementById("customer-id").value;
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById("customer-address").value.trim();
  const opening_balance = parseFloat(document.getElementById("customer-opening-balance").value) || 0.0;
  const notes = document.getElementById("customer-notes").value.trim();

  try {
    if (id) {
      // Edit
      await apiRequest(`/api/customers/${id}`, "PUT", { name, phone, address, notes });
      showToast("Customer updated successfully!", "success");
    } else {
      // Add
      await apiRequest("/api/customers", "POST", { name, phone, address, opening_balance, notes });
      showToast("Customer added successfully!", "success");
    }
    closeModal("modal-customer");
    fetchCustomers();
  } catch (err) {}
}

function confirmDeleteCustomer(id, name) {
  showConfirmDialog(
    t("deleteCustomer"),
    `${t("confirmDelete")} (${name})`,
    async () => {
      try {
        await apiRequest(`/api/customers/${id}`, "DELETE");
        showToast("Customer deleted successfully", "success");
        fetchCustomers();
      } catch (err) {}
    }
  );
}

/* Customer Statement View Modal */
async function openCustomerStatementModal(id) {
  try {
    const data = await apiRequest(`/api/customers/${id}`);
    const c = data.customer;
    const ledger = data.ledger;

    const modal = document.getElementById("modal-statement");
    const content = document.getElementById("statement-modal-body");

    content.innerHTML = `
      <div class="statement-header">
        <div>
          <h2 style="color: var(--primary); font-weight: 700;">${escapeHtml(c.name)}</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted);">${t('phoneLabel')}: ${escapeHtml(c.phone || 'N/A')}</p>
          <p style="font-size: 0.9rem; color: var(--text-muted);">${t('address')}: ${escapeHtml(c.address || 'N/A')}</p>
        </div>
        <div style="text-align: right;">
          <h4>${t('customerStatementTitle')}</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${t('date')}: ${new Date().toLocaleDateString()}</p>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${t('openingBalance')}: DKB ${c.opening_balance.toFixed(2)}</p>
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>${t('date')}</th>
              <th>${t('description')}</th>
              <th>${t('paymentMethod')}</th>
              <th>${t('totalCreditGiven')}</th>
              <th>${t('totalPaymentReceived')}</th>
              <th>${t('currentBalance')}</th>
            </tr>
          </thead>
          <tbody>
            ${ledger.length === 0 ? `<tr><td colspan="6" style="text-align: center;">${t('noDataFound')}</td></tr>` : 
              ledger.map(row => `
                <tr>
                  <td>${row.date}</td>
                  <td>${escapeHtml(row.description || row.type)}</td>
                  <td>${row.payment_method}</td>
                  <td style="color: var(--accent-red); font-weight: 600;">${row.type === 'credit' ? 'DKB ' + row.amount.toFixed(2) : '-'}</td>
                  <td style="color: var(--accent-green); font-weight: 600;">${row.type === 'debit' ? 'DKB ' + row.amount.toFixed(2) : '-'}</td>
                  <td style="font-weight: 700;">DKB ${row.running_balance.toFixed(2)}</td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>

      <div class="statement-totals">
        <div>${t('totalCreditGiven')}: <span style="color: var(--accent-red);">DKB ${c.total_credit.toFixed(2)}</span></div>
        <div>${t('totalPaymentReceived')}: <span style="color: var(--accent-green);">DKB ${c.total_received.toFixed(2)}</span></div>
        <div>${t('remainingBalance')}: <span style="color: var(--primary);">DKB ${c.current_balance.toFixed(2)}</span></div>
        ${c.current_balance > 0 && c.phone ? `
        <div style="margin-top: 0.75rem;">
          <button class="btn btn-sm" style="background: #25D366; color: white; border: none; display: inline-flex; align-items: center; gap: 0.4rem;" onclick="sendWhatsAppReminder('${escapeHtml(c.phone)}', '${escapeHtml(c.name)}', ${c.current_balance})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            Send WhatsApp Reminder
          </button>
        </div>` : ''}
      </div>
    `;

    if (modal) modal.classList.add("active");
  } catch (err) {
    console.error("Statement Load Error:", err);
  }
}
