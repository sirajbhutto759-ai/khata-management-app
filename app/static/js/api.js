/* ==========================================================================
   Khata Management & Accounting App - API Client
   ========================================================================== */

const API_BASE = "";

function getAuthToken() {
  return localStorage.getItem("khata_token");
}

async function apiRequest(endpoint, method = "GET", data = null, isFormData = false) {
  const headers = {};
  const token = getAuthToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (data && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = isFormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (response.status === 401 && !endpoint.includes("/api/auth/login")) {
      // Token expired or invalid
      localStorage.removeItem("khata_token");
      localStorage.removeItem("khata_user");
      window.showToast(t("loginTitle"), "error");
      window.showAuthModal("login");
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: response.statusText }));
      const msg = errData.detail || "An error occurred";
      window.showToast(msg, "error");
      throw new Error(msg);
    }

    // Check if response is json or blob/file
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.blob();
    }
  } catch (err) {
    console.error("API Request Error:", err);
    throw err;
  }
}
