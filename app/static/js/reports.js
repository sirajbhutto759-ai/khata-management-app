/* ==========================================================================
   Khata Management & Accounting App - Reports & CSV / PDF Generator
   ========================================================================== */

let activeReportTab = "monthly";

async function renderReportsView() {
  const container = document.getElementById("main-content-view");
  if (!container) return;

  container.innerHTML = `
    <!-- Top Action Header -->
    <div class="action-banner">
      <div>
        <h3 style="font-weight: 700; font-size: 1.25rem;">${t('reportsHeader')}</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${t('profitLossReport')} & ${t('exportCSV')}</p>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn btn-primary" onclick="exportReportCSV()">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          ${t('exportCSV')}
        </button>

        <button class="btn btn-outline" onclick="window.print()">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          ${t('printStatement')}
        </button>
      </div>
    </div>

    <!-- Report Tabs Bar -->
    <div class="table-card" style="padding: 1rem; margin-bottom: 1.25rem;">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-sm ${activeReportTab === 'daily' ? 'btn-primary' : 'btn-outline'}" onclick="switchReportTab('daily')">${t('dailyReport')}</button>
          <button class="btn btn-sm ${activeReportTab === 'weekly' ? 'btn-primary' : 'btn-outline'}" onclick="switchReportTab('weekly')">${t('weeklyReport')}</button>
          <button class="btn btn-sm ${activeReportTab === 'monthly' ? 'btn-primary' : 'btn-outline'}" onclick="switchReportTab('monthly')">${t('monthlyReport')}</button>
          <button class="btn btn-sm ${activeReportTab === 'receivables' ? 'btn-primary' : 'btn-outline'}" onclick="switchReportTab('receivables')">${t('receivableReport')}</button>
          <button class="btn btn-sm ${activeReportTab === 'payables' ? 'btn-primary' : 'btn-outline'}" onclick="switchReportTab('payables')">${t('payableReport')}</button>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="date" id="report-start-date" class="form-control" style="width: 140px;" onchange="fetchReportData()">
          <span>to</span>
          <input type="date" id="report-end-date" class="form-control" style="width: 140px;" onchange="fetchReportData()">
        </div>
      </div>
    </div>

    <!-- Dynamic Report Display Container -->
    <div id="report-display-container">
      <div style="text-align: center; padding: 2rem;">Loading report...</div>
    </div>
  `;

  // Pre-fill default date range: first of current month to today
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const formatDate = (d) => d.toISOString().split('T')[0];
  
  const startInput = document.getElementById("report-start-date");
  const endInput = document.getElementById("report-end-date");
  if (startInput && !startInput.value) startInput.value = formatDate(firstOfMonth);
  if (endInput && !endInput.value) endInput.value = formatDate(today);

  fetchReportData();
}

function switchReportTab(tab) {
  activeReportTab = tab;
  renderReportsView();
}

async function fetchReportData() {
  const display = document.getElementById("report-display-container");
  if (!display) return;

  const sDate = document.getElementById("report-start-date") ? document.getElementById("report-start-date").value : "";
  const eDate = document.getElementById("report-end-date") ? document.getElementById("report-end-date").value : "";

  try {
    if (activeReportTab === "receivables") {
      const data = await apiRequest("/api/reports/receivables");
      display.innerHTML = `
        <div class="metric-card" style="margin-bottom: 1.25rem;">
          <div class="metric-icon receivable"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg></div>
          <div class="metric-details">
            <p>${t('totalReceivable')}</p>
            <h3 style="color: var(--accent-red);">DKB ${data.total_receivable.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
          </div>
        </div>

        <div class="table-card">
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>${t('customerName')}</th>
                  <th>${t('phoneLabel')}</th>
                  <th>${t('totalCreditGiven')}</th>
                  <th>${t('totalPaymentReceived')}</th>
                  <th>${t('currentBalance')}</th>
                </tr>
              </thead>
              <tbody>
                ${(data.debtors && data.debtors.length > 0) ? data.debtors.map(d => `
                  <tr>
                    <td><strong>${escapeHtml(d.name)}</strong></td>
                    <td>${escapeHtml(d.phone || '-')}</td>
                    <td>DKB ${(d.total_credit || 0).toFixed(2)}</td>
                    <td>DKB ${(d.total_received || 0).toFixed(2)}</td>
                    <td style="font-weight: 700; color: var(--accent-red);">DKB ${(d.balance || 0).toFixed(2)}</td>
                  </tr>
                `).join('') : `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">${t('noDataFound')}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeReportTab === "payables") {
      const data = await apiRequest("/api/reports/payables");
      display.innerHTML = `
        <div class="metric-card" style="margin-bottom: 1.25rem;">
          <div class="metric-icon payable"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14"></path></svg></div>
          <div class="metric-details">
            <p>${t('totalPayable')}</p>
            <h3 style="color: var(--accent-amber);">DKB ${data.total_payable.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
          </div>
        </div>

        <div class="table-card">
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>${t('customerName')}</th>
                  <th>${t('phoneLabel')}</th>
                  <th>${t('totalCreditGiven')}</th>
                  <th>${t('totalPaymentReceived')}</th>
                  <th>${t('currentBalance')}</th>
                </tr>
              </thead>
              <tbody>
                ${(data.creditors && data.creditors.length > 0) ? data.creditors.map(c => `
                  <tr>
                    <td><strong>${escapeHtml(c.name)}</strong></td>
                    <td>${escapeHtml(c.phone || '-')}</td>
                    <td>DKB ${(c.total_credit || 0).toFixed(2)}</td>
                    <td>DKB ${(c.total_received || 0).toFixed(2)}</td>
                    <td style="font-weight: 700; color: var(--accent-amber);">DKB ${(c.balance || 0).toFixed(2)}</td>
                  </tr>
                `).join('') : `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">${t('noDataFound')}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      // Summary & P&L Report
      const summary = await apiRequest(`/api/reports/summary?report_type=${activeReportTab}&start_date=${sDate}&end_date=${eDate}`);
      let netColor = summary.net_profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';

      display.innerHTML = `
        <div class="grid-4">
          <div class="metric-card">
            <div class="metric-icon income"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 11l5-5 5 5M12 6v12"></path></svg></div>
            <div class="metric-details">
              <p>${t('todaysIncome')}</p>
              <h3 style="color: var(--accent-green);">DKB ${summary.total_income.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon expense"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 13l-5 5-5-5M12 18V6"></path></svg></div>
            <div class="metric-details">
              <p>${t('totalExpenses')}</p>
              <h3 style="color: var(--accent-blue);">DKB ${summary.total_expense.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon receivable"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg></div>
            <div class="metric-details">
              <p>${t('totalCreditGiven')}</p>
              <h3 style="color: var(--accent-red);">DKB ${summary.total_credit_given.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon payable"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg></div>
            <div class="metric-details">
              <p>${t('netProfit')}</p>
              <h3 style="color: ${netColor};">DKB ${summary.net_profit.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3>
            </div>
          </div>
        </div>

        <div class="table-card">
          <div class="table-header"><h4 style="font-weight: 700;">${t('transactions')} (${summary.transactions_count})</h4></div>
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
              <tbody>
                ${(summary.transactions && summary.transactions.length > 0) ? summary.transactions.map(t => `
                  <tr>
                    <td>${t.date}</td>
                    <td><strong>${escapeHtml(t.customer_name)}</strong></td>
                    <td><span class="type-badge ${t.type === 'credit' ? 'credit' : 'debit'}">${t.type}</span></td>
                    <td>${t.payment_method}</td>
                    <td style="font-weight: 700;">DKB ${t.amount.toFixed(2)}</td>
                  </tr>
                `).join('') : `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">${t('noDataFound')}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  } catch (err) {
    console.error("Report fetch error:", err);
  }
}

async function exportReportCSV() {
  let target = "transactions";
  if (activeReportTab === "receivables") target = "receivables";
  else if (activeReportTab === "payables") target = "payables";

  const sDate = document.getElementById("report-start-date") ? document.getElementById("report-start-date").value : "";
  const eDate = document.getElementById("report-end-date") ? document.getElementById("report-end-date").value : "";

  let url = `/api/reports/export/csv?report_type=${target}`;
  if (sDate) url += `&start_date=${encodeURIComponent(sDate)}`;
  if (eDate) url += `&end_date=${encodeURIComponent(eDate)}`;

  try {
    const res = await apiRequest(url);
    const blob = res instanceof Blob
      ? res
      : new Blob([res], { type: "text/csv;charset=utf-8;" });
    const urlBlob = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlBlob;
    a.download = `khata_${target}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(urlBlob);
    showToast("CSV exported successfully!", "success");
  } catch (err) {
    console.error("CSV Export error:", err);
    showToast("Failed to export CSV", "error");
  }
}
