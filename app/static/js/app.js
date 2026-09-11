/* ==========================================================================
   Khata Management & Accounting App - Core App Controller & Navigation
   ========================================================================== */

window.currentTab = "dashboard";

document.addEventListener("DOMContentLoaded", () => {
  // Restore saved theme and language first
  if (typeof restoreSavedTheme === 'function') restoreSavedTheme();
  const savedLang = localStorage.getItem("khata_lang") || "en";
  if (savedLang !== currentLang) setLanguage(savedLang);

  // Initialize Auth state
  updateUserUI();

  if (getCurrentUser()) {
    switchTab("dashboard");
    fetchNotificationsCount();
  }

  // Setup click listeners for modal overlays
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });
});

function switchTab(tabName) {
  window.currentTab = tabName;

  // Update Desktop Sidebar active pill
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  const activeSidebarItem = document.getElementById(`nav-${tabName}`);
  if (activeSidebarItem) activeSidebarItem.classList.add("active");

  // Update Mobile Nav active pill
  document.querySelectorAll(".mobile-nav-item").forEach(el => el.classList.remove("active"));
  const activeMobileItem = document.getElementById(`mobile-nav-${tabName}`);
  if (activeMobileItem) activeMobileItem.classList.add("active");

  // Render view
  renderCurrentView();
}

function renderCurrentView() {
  if (window.currentTab === "dashboard") renderDashboard();
  else if (window.currentTab === "customers") renderCustomersView();
  else if (window.currentTab === "transactions") renderTransactionsView();
  else if (window.currentTab === "expenses") renderExpensesView();
  else if (window.currentTab === "reports") renderReportsView();
  else if (window.currentTab === "settings") renderSettingsView();
}

/* Global Search Handler */
function handleGlobalSearch(query) {
  if (!query || query.trim().length === 0) return;
  
  if (window.currentTab !== "customers" && window.currentTab !== "transactions") {
    switchTab("customers");
  }
  
  setTimeout(() => {
    const custSearchInput = document.getElementById("customer-search-input");
    if (custSearchInput) {
      custSearchInput.value = query;
      searchCustomers(query);
    }
  }, 100);
}

/* Modals */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

/* Toast System */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  let iconSvg = type === 'success' ? 
    '<svg width="20" height="20" fill="none" stroke="#10b981" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>' :
    (type === 'error' ? '<svg width="20" height="20" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>' :
    '<svg width="20" height="20" fill="none" stroke="#3b82f6" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>');

  toast.innerHTML = `
    ${iconSvg}
    <span style="font-size: 0.875rem; font-weight: 500;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* Confirmation Dialog */
function showConfirmDialog(title, message, onConfirm) {
  const modal = document.getElementById("modal-confirm");
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-message").textContent = message;

  const btnYes = document.getElementById("confirm-yes-btn");
  btnYes.onclick = async () => {
    closeModal("modal-confirm");
    await onConfirm();
  };

  if (modal) modal.classList.add("active");
}

/* Notifications Dropdown */
async function fetchNotificationsCount() {
  try {
    const res = await apiRequest("/api/notifications");
    const badge = document.getElementById("notif-badge");
    if (badge) {
      if (res.unread_count > 0) {
        badge.style.display = "flex";
        badge.textContent = res.unread_count;
      } else {
        badge.style.display = "none";
      }
    }
  } catch (err) {}
}

async function toggleNotificationsDropdown() {
  const dropdown = document.getElementById("notif-dropdown");
  if (!dropdown) return;

  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
    try {
      const res = await apiRequest("/api/notifications");
      const listContainer = document.getElementById("notif-list");
      if (res.notifications.length === 0) {
        listContainer.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">${t('noDataFound')}</div>`;
      } else {
        listContainer.innerHTML = res.notifications.map(n => `
          <div onclick="markNotificationRead(${n.id}, this)" style="padding: 0.75rem; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s; ${n.is_read ? 'opacity: 0.6;' : 'font-weight: 600; background: var(--bg-primary-subtle, rgba(99,102,241,0.05));'}" onmouseenter="this.style.background='var(--bg-hover, rgba(0,0,0,0.03))'" onmouseleave="this.style.background='${n.is_read ? '' : 'var(--bg-primary-subtle, rgba(99,102,241,0.05))'}'">
            <div style="font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
              <span>${escapeHtml(n.title)}</span>
              ${!n.is_read ? '<span style="width: 8px; height: 8px; background: var(--primary); border-radius: 50%; flex-shrink: 0;"></span>' : ''}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">${escapeHtml(n.message)}</div>
          </div>
        `).join("");
      }
    } catch (err) {}
  }
}

async function markNotificationRead(id, el) {
  try {
    await apiRequest(`/api/notifications/${id}/read`, "PUT");
    if (el) {
      el.style.opacity = "0.6";
      el.style.fontWeight = "normal";
      el.style.background = "";
      // Remove blue dot
      const dot = el.querySelector('span[style*="border-radius: 50%"]');
      if (dot) dot.remove();
    }
    fetchNotificationsCount();
  } catch (err) {}
}

async function markAllNotificationsRead() {
  try {
    await apiRequest("/api/notifications/read-all", "PUT");
    showToast("All notifications marked as read", "success");
    fetchNotificationsCount();
    // Refresh the dropdown list
    const dropdown = document.getElementById("notif-dropdown");
    if (dropdown && dropdown.style.display === "block") {
      dropdown.style.display = "none";
      toggleNotificationsDropdown();
    }
  } catch (err) {}
}

// Click outside to dismiss notifications dropdown
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("notif-dropdown");
  if (!dropdown || dropdown.style.display !== "block") return;
  
  const isInsideDropdown = dropdown.contains(e.target);
  const isNotifButton = e.target.closest('.icon-btn[onclick*="toggleNotifications"]') || 
                         e.target.closest('button[onclick*="toggleNotifications"]');
  
  if (!isInsideDropdown && !isNotifButton) {
    dropdown.style.display = "none";
  }
});

/* WhatsApp Reminder Helper */
function sendWhatsAppReminder(phone, customerName, balance) {
  if (!phone) {
    showToast("No phone number available for this customer", "error");
    return;
  }
  // Clean phone number
  let cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '92' + cleanPhone.substring(1);
  }
  if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('92')) {
    cleanPhone = '92' + cleanPhone;
  }

  const user = getCurrentUser() || {};
  const businessName = user.business_name || 'Our Business';
  
  let msg;
  if (currentLang === 'ur') {
    msg = `السلام علیکم ${customerName} صاحب،\n\nیہ ${businessName} کی جانب سے یاد دہانی ہے۔ آپ کے کھاتے میں DKB ${Math.abs(balance).toLocaleString('en-US', {minimumFractionDigits:2})} بقایا ہے۔\n\nبراہ کرم جلد از جلد ادائیگی کر دیں۔\n\nجزاک اللہ خیراً`;
  } else {
    msg = `Assalamu Alaikum ${customerName},\n\nThis is a friendly reminder from ${businessName}. Your outstanding balance is DKB ${Math.abs(balance).toLocaleString('en-US', {minimumFractionDigits:2})}.\n\nPlease settle at your earliest convenience.\n\nJazakAllah Khair`;
  }

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

/* Helper Utilities */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
