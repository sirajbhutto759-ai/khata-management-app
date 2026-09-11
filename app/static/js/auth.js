/* ==========================================================================
   Khata Management & Accounting App - Authentication Manager
   ========================================================================== */

function getCurrentUser() {
  const u = localStorage.getItem("khata_user");
  return u ? JSON.parse(u) : null;
}

function setCurrentUser(user, token = null) {
  if (token) {
    localStorage.setItem("khata_token", token);
  }
  if (user) {
    localStorage.setItem("khata_user", JSON.stringify(user));
  }
  updateUserUI();
}

function updateUserUI() {
  const user = getCurrentUser();
  const authContainer = document.getElementById("auth-container");
  const appContainer = document.getElementById("app-container");

  if (!user || !getAuthToken()) {
    if (authContainer) authContainer.style.display = "flex";
    if (appContainer) appContainer.style.display = "none";
  } else {
    if (authContainer) authContainer.style.display = "none";
    if (appContainer) appContainer.style.display = "flex";

    // Set Header User Info
    const userNameEl = document.getElementById("user-name-display");
    const userRoleEl = document.getElementById("user-business-display");
    const userAvatarEl = document.getElementById("user-avatar-display");

    if (userNameEl) userNameEl.textContent = user.owner_name;
    if (userRoleEl) userRoleEl.textContent = user.business_name;
    if (userAvatarEl) userAvatarEl.textContent = user.owner_name ? user.owner_name.charAt(0).toUpperCase() : "K";

    // Apply saved theme & language
    if (user.theme) {
      document.documentElement.setAttribute("data-theme", user.theme);
    }
    if (user.language) {
      setLanguage(user.language);
    }
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const res = await apiRequest("/api/auth/login", "POST", { email, password });
    setCurrentUser(res.user, res.access_token);
    showToast(`Assalamu Alaikum, ${res.user.owner_name}!`, "success");
    if (window.renderDashboard) window.renderDashboard();
  } catch (err) {
    // Handled by apiRequest toast
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const business_name = document.getElementById("reg-business-name").value.trim();
  const owner_name = document.getElementById("reg-owner-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const password = document.getElementById("reg-password").value;

  try {
    const res = await apiRequest("/api/auth/register", "POST", {
      business_name, owner_name, email, phone, password
    });
    setCurrentUser(res.user, res.access_token);
    showToast(t("registerTitle") + " - Success!", "success");
    if (window.renderDashboard) window.renderDashboard();
  } catch (err) {
    // Handled by apiRequest toast
  }
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById("forgot-email").value.trim();
  try {
    const res = await apiRequest("/api/auth/forgot-password", "POST", { email });
    showToast(res.message, "success");
    if (res.reset_token) {
      // Automatic simulation helper
      const newPwd = prompt("Enter your new password:");
      if (newPwd) {
        await apiRequest("/api/auth/reset-password", "POST", { token: res.reset_token, new_password: newPwd });
        showToast("Password reset successfully!", "success");
        showAuthModal("login");
      }
    }
  } catch (err) {}
}

function logoutUser() {
  localStorage.removeItem("khata_token");
  localStorage.removeItem("khata_user");
  updateUserUI();
  showToast(t("logout"), "success");
}

function showAuthModal(viewName) {
  const loginForm = document.getElementById("form-login");
  const regForm = document.getElementById("form-register");
  const forgotForm = document.getElementById("form-forgot");

  if (loginForm) loginForm.style.display = viewName === "login" ? "block" : "none";
  if (regForm) regForm.style.display = viewName === "register" ? "block" : "none";
  if (forgotForm) forgotForm.style.display = viewName === "forgot" ? "block" : "none";
}
