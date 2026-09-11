/* ==========================================================================
   Khata Management & Accounting App - Settings & Database Backup/Restore
   ========================================================================== */

async function renderSettingsView() {
  const container = document.getElementById("main-content-view");
  if (!container) return;

  const user = getCurrentUser() || {};

  container.innerHTML = `
    <!-- Top Action Header -->
    <div class="action-banner">
      <div>
        <h3 style="font-weight: 700; font-size: 1.25rem;">${t('settings')}</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${user.business_name} - ${user.owner_name}</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
      <!-- Profile & Business Info -->
      <div class="table-card" style="padding: 1.5rem;">
        <h4 style="font-weight: 700; margin-bottom: 1.25rem; font-size: 1.1rem; color: var(--primary);">Business Profile Settings</h4>
        
        <form onsubmit="handleUpdateProfileSettings(event)">
          <div class="form-group">
            <label>${t('businessNameLabel')}</label>
            <input type="text" id="set-business-name" class="form-control" value="${escapeHtml(user.business_name || '')}" required>
          </div>

          <div class="form-group">
            <label>${t('ownerNameLabel')}</label>
            <input type="text" id="set-owner-name" class="form-control" value="${escapeHtml(user.owner_name || '')}" required>
          </div>

          <div class="form-group">
            <label>${t('phoneLabel')}</label>
            <input type="text" id="set-phone" class="form-control" value="${escapeHtml(user.phone || '')}">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Currency</label>
              <select id="set-currency" class="form-control">
                <option value="DKB" ${(!user.currency || user.currency === 'DKB') ? 'selected' : ''}>DKB</option>
                <option value="PKR" ${user.currency === 'PKR' ? 'selected' : ''}>PKR (₨)</option>
                <option value="USD" ${user.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                <option value="AED" ${user.currency === 'AED' ? 'selected' : ''}>AED (د.إ)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Language / زبان</label>
              <select id="set-language" class="form-control" onchange="setLanguage(this.value)">
                <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
                <option value="ur" ${currentLang === 'ur' ? 'selected' : ''}>اردو (Urdu)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Theme</label>
            <select id="set-theme" class="form-control" onchange="toggleTheme(this.value)">
              <option value="light" ${(localStorage.getItem('khata_theme') || 'light') !== 'dark' ? 'selected' : ''}>Light Theme</option>
              <option value="dark" ${localStorage.getItem('khata_theme') === 'dark' ? 'selected' : ''}>Dark Theme</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">${t('save')}</button>
        </form>
      </div>

      <!-- Password Change & Backup/Restore -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Change Password Card -->
        <div class="table-card" style="padding: 1.5rem;">
          <h4 style="font-weight: 700; margin-bottom: 1.25rem; font-size: 1.1rem; color: var(--accent-amber);">Security & Password</h4>
          
          <form onsubmit="handleChangePasswordSettings(event)">
            <div class="form-group">
              <label>Current Password</label>
              <input type="password" id="set-old-pwd" class="form-control" required>
            </div>

            <div class="form-group">
              <label>New Password</label>
              <input type="password" id="set-new-pwd" class="form-control" required minlength="6">
            </div>

            <button type="submit" class="btn btn-outline" style="width: 100%;">${t('save')}</button>
          </form>
        </div>

        <!-- Database Backup & Restore Card -->
        <div class="table-card" style="padding: 1.5rem;">
          <h4 style="font-weight: 700; margin-bottom: 0.5rem; font-size: 1.1rem; color: var(--accent-blue);">Database Backup & Restore</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">Safeguard your business Khata records by downloading a full JSON database backup or restoring a previous file.</p>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button class="btn btn-success" onclick="downloadDatabaseBackup()">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Full Backup (.json)
            </button>

            <div style="border-top: 1px solid var(--border-color); margin: 0.5rem 0;"></div>

            <input type="file" id="restore-file-input" accept=".json" style="display: none;" onchange="handleFileRestore(event)">
            <button class="btn btn-outline" onclick="document.getElementById('restore-file-input').click()">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Restore Database Backup
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

async function handleUpdateProfileSettings(e) {
  e.preventDefault();
  const business_name = document.getElementById("set-business-name").value.trim();
  const owner_name = document.getElementById("set-owner-name").value.trim();
  const phone = document.getElementById("set-phone").value.trim();
  const currency = document.getElementById("set-currency").value;
  const language = document.getElementById("set-language").value;
  const theme = document.getElementById("set-theme").value;

  try {
    const updated = await apiRequest("/api/auth/profile", "PUT", {
      business_name, owner_name, phone, currency, language, theme
    });

    setCurrentUser(updated);
    showToast("Profile settings saved!", "success");
  } catch (err) {}
}

async function handleChangePasswordSettings(e) {
  e.preventDefault();
  const old_password = document.getElementById("set-old-pwd").value;
  const new_password = document.getElementById("set-new-pwd").value;

  try {
    await apiRequest("/api/auth/change-password", "POST", { old_password, new_password });
    showToast("Password updated successfully!", "success");
    document.getElementById("set-old-pwd").value = "";
    document.getElementById("set-new-pwd").value = "";
  } catch (err) {}
}

async function downloadDatabaseBackup() {
  try {
    const res = await apiRequest("/api/settings/backup");
    const blob = res instanceof Blob
      ? res
      : new Blob([typeof res === "string" ? res : JSON.stringify(res, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khata_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    showToast("Backup downloaded successfully!", "success");
  } catch (err) {
    console.error("Backup download error:", err);
    showToast("Failed to download backup", "error");
  }
}

async function handleFileRestore(e) {
  const file = e.target.files[0];
  if (!file) return;

  showConfirmDialog(
    "Restore Database",
    t("confirmReset"),
    async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        await apiRequest("/api/settings/restore", "POST", formData, true);
        showToast("Database restored successfully!", "success");
        renderSettingsView();
      } catch (err) {}
    }
  );
}

function toggleTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("khata_theme", theme);
}

// Called on app init to restore saved theme
function restoreSavedTheme() {
  const saved = localStorage.getItem("khata_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
}
