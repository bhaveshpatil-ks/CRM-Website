const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const SESSION_KEY = "call-flow-session";

export const clearSession = () => localStorage.removeItem(SESSION_KEY);

async function request(path, options = {}) {
  const idToken = localStorage.getItem(SESSION_KEY) || "";
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export const api = {
  companyLogin: async (payload) => {
    const result = await request("/company-auth/lookup", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localStorage.setItem(SESSION_KEY, result.token);
    return result;
  },
  adminLogin: async (payload) => {
    const result = await request("/admin-auth/lookup", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localStorage.setItem(SESSION_KEY, result.token);
    return result;
  },
  login: async (payload) => api.companyLogin(payload),
  registerCompany: (payload) =>
    request("/company-requests", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getCurrentUser: () => request("/auth/me"),
  getCompanyRequests: () => request("/admin/company-requests"),
  reviewCompanyRequest: (id, payload) =>
    request(`/admin/company-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  getDashboard: () => request("/dashboard"),
  getLeads: () => request("/leads"),
  getLead: (id) => request(`/leads/${id}`),
  createLead: (payload) =>
    request("/leads", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  addNote: (id, content) =>
    request(`/leads/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ content })
    }),
  addInteraction: (id, payload) =>
    request(`/leads/${id}/interactions`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  summarizeNote: (text) =>
    request("/ai/summarize-note", {
      method: "POST",
      body: JSON.stringify({ text })
    }),
  updateFollowUp: (id, nextFollowUpAt) =>
    request(`/leads/${id}/follow-up`, {
      method: "PATCH",
      body: JSON.stringify({ nextFollowUpAt })
    })
};
