/* ==========================================================================
   Khata Management & Accounting App - Dashboard View
   ========================================================================== */

let monthlyChartInstance = null;

async function renderDashboard() {
  const container = document.getElementById("main-content-view");
  if (!container) return;

  container.innerHTML = `
    <!-- Top KPI Cards -->
    <div class="grid-4">
      <div class="metric-card">
        <div class="metric-icon receivable">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
        </div>
        <div class="metric-details">
          <p data-i18n="totalReceivable">${t('totalReceivable')}</p>
          <h3 id="dash-receivable" style="color: var(--accent-red)">DKB 0.00</h3>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon payable">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14"></path></svg>
        </div>
        <div class="metric-details">
          <p data-i18n="totalPayable">${t('totalPayable')}</p>
          <h3 id="dash-payable" style="color: var(--accent-amber)">DKB 0.00</h3>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon income">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 11l5-5 5 5M12 6v12"></path></svg>
        </div>
        <div class="metric-details">
          <p data-i18n="todaysIncome">${t('todaysIncome')}</p>
          <h3 id="dash-income" style="color: var(--accent-green)">DKB 0.00</h3>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon expense">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 13l-5 5-5-5M12 18V6"></path></svg>
        </div>
        <div class="metric-details">
          <p data-i18n="todaysExpenses">${t('todaysExpenses')}</p>
          <h3 id="dash-expenses" style="color: var(--accent-blue)">DKB 0.00</h3>
        </div>
      </div>
    </div>

    <!-- Quick Buttons Banner -->
    <div class="action-banner">
      <div>
        <h4 style="font-size: 1.1rem; font-weight: 700;">${t('appName')}</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${t('subName')}</p>
      </div>
      <div class="action-buttons">
        <button class="btn btn-primary" onclick="openAddCustomerModal()">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"></path></svg>
          ${t('addCustomer')}
        </button>

        <button class="btn btn-danger" onclick="openAddTxModal('credit')">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
          ${t('giveCredit')}
        </button>

        <button class="btn btn-success" onclick="openAddTxModal('debit')">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14"></path></svg>
          ${t('receivePayment')}
        </button>

        <button class="btn btn-outline" onclick="openAddExpenseModal()">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2"></path></svg>
          ${t('addExpense')}
        </button>
      </div>
    </div>

    <!-- Chart & Top Debtors Section -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
      <!-- Chart Card -->
      <div class="table-card" style="padding: 1.25rem;">
        <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem;">${t('monthlyChartTitle')}</h4>
        <div style="height: 240px; position: relative;">
          <canvas id="monthlyChart"></canvas>
        </div>
      </div>

      <!-- Top Debtors Card -->
      <div class="table-card">
        <div class="table-header">
          <h4 style="font-size: 1rem; font-weight: 700;">${t('topDebtorsTitle')}</h4>
          <a class="btn btn-sm btn-outline" onclick="switchTab('customers')" style="cursor: pointer;">${t('viewAll')}</a>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>${t('customerName')}</th>
                <th>${t('phoneLabel')}</th>
                <th>${t('currentBalance')}</th>
                <th>${t('actions')}</th>
              </tr>
            </thead>
            <tbody id="dash-top-debtors-body">
              <tr><td colspan="4" style="text-align: center;">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Recent Transactions Table -->
    <div class="table-card">
      <div class="table-header">
        <h4 style="font-size: 1rem; font-weight: 700;">${t('recentTxsTitle')}</h4>
        <a class="btn btn-sm btn-outline" onclick="switchTab('transactions')" style="cursor: pointer;">${t('viewAll')}</a>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>${t('date')}</th>
              <th>${t('customerName')}</th>
              <th>${t('txType')}</th>
              <th>${t('paymentMethod')}</th>
              <th>${t('amount')}</th>
            </tr>
          </thead>
          <tbody id="dash-recent-txs-body">
            <tr><td colspan="5" style="text-align: center;">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Fetch Dashboard Summary Data
  try {
    const summary = await apiRequest("/api/dashboard/summary");

    // Populate Cards
    document.getElementById("dash-receivable").textContent = `RS ${summary.total_receivable.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById("dash-payable").textContent = `RS ${summary.total_payable.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById("dash-income").textContent = `RS ${summary.todays_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById("dash-expenses").textContent = `RS ${summary.todays_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    // Populate Top Debtors
    const debtorsBody = document.getElementById("dash-top-debtors-body");
    if (summary.top_debtors && summary.top_debtors.length > 0) {
      debtorsBody.innerHTML = summary.top_debtors.map(d => `
        <tr>
          <td><strong>${escapeHtml(d.name)}</strong></td>
          <td>${escapeHtml(d.phone || '-')}</td>
          <td style="color: var(--accent-red); font-weight: 700;">DKB ${d.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="display: flex; gap: 5px;">
            <button class="btn btn-sm btn-primary" onclick="openCustomerStatementModal(${d.id})">${t('viewStatement')}</button>
            ${d.phone ? `<button class="btn btn-sm" style="background: #25D366; color: white; border: none;" onclick="sendWhatsAppReminder('${escapeHtml(d.phone)}', '${escapeHtml(d.name)}', ${d.current_balance})" title="WhatsApp Reminder">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            </button>` : ''}
          </td>
        </tr>
      `).join("");
    } else {
      debtorsBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">${t('noDataFound')}</td></tr>`;
    }

    // Populate Recent Transactions
    const txsBody = document.getElementById("dash-recent-txs-body");
    if (summary.recent_transactions && summary.recent_transactions.length > 0) {
      txsBody.innerHTML = summary.recent_transactions.map(tx => {
        let badgeClass = tx.type === 'credit' ? 'credit' : (tx.type === 'debit' ? 'debit' : 'expense');
        let typeName = tx.type === 'credit' ? TRANSLATIONS[currentLang].creditType : (tx.type === 'debit' ? TRANSLATIONS[currentLang].debitType : tx.type);
        let amtColor = tx.type === 'credit' ? 'var(--accent-red)' : 'var(--accent-green)';
        let amtPrefix = tx.type === 'credit' ? '+' : '-';

        return `
          <tr>
            <td>${tx.date}</td>
            <td><strong>${escapeHtml(tx.customer_name || '-')}</strong></td>
            <td><span class="type-badge ${badgeClass}">${typeName}</span></td>
            <td>${tx.payment_method}</td>
            <td style="font-weight: 700; color: ${amtColor}">${amtPrefix} DKB ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      }).join("");
    } else {
      txsBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">${t('noDataFound')}</td></tr>`;
    }

    // Render Chart.js
    renderMonthlyChart(summary.monthly_chart);

  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
}

function renderMonthlyChart(chartData) {
  const ctx = document.getElementById('monthlyChart');
  if (!ctx) return;

  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
  }

  monthlyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: t('todaysIncome'),
          data: chartData.income,
          backgroundColor: '#10b981',
          borderRadius: 6
        },
        {
          label: t('todaysExpenses'),
          data: chartData.expenses,
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) { return 'DKB ' + value.toLocaleString(); }
          }
        }
      }
    }
  });
}
