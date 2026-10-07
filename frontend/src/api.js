const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
let sessionPromise;
export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Numerologic-Client": "web",
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    throw new Error(
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((x) => x.msg).join("; ")
          : "Сервис недоступен. Попробуйте ещё раз.",
    );
  }
  return body;
}
function post(path, data = {}) {
  return request(path, { method: "POST", body: JSON.stringify(data) });
}
export async function ensureSession() {
  if (!sessionPromise)
    sessionPromise = post("/api/auth/session").catch((error) => {
      sessionPromise = null;
      throw error;
    });
  return sessionPromise;
}
async function secured(path, options) {
  await ensureSession();
  return request(path, options);
}
function securePost(path, data) {
  return secured(path, { method: "POST", body: JSON.stringify(data) });
}
export const api = {
  config: () => request("/api/config"),
  me: () => secured("/api/me"),
  products: () => request("/api/products"),
  product: (slug) => request(`/api/products/${encodeURIComponent(slug)}`),
  completeQuiz: (payload) => securePost("/api/quiz/complete", payload),
  createCheckout: (payload) => securePost("/api/checkout/create", payload),
  order: (id) => secured(`/api/orders/${Number(id)}`),
  mockSuccess: (id) =>
    securePost("/api/checkout/mock-success", { order_id: Number(id) }),
  compatibilityPreview: (payload) =>
    securePost("/api/compatibility/preview", payload),
  report: (id) => secured(`/api/reports/${Number(id)}`),
  dashboard: () => secured("/api/dashboard"),
  today: () => secured("/api/today"),
  insight: () => securePost("/api/insight", {}),
  discuss: (id) => securePost(`/api/reports/${id}/discuss`, {}),
  journal: (data) => securePost("/api/journal", data),
  login: (data) =>
    post("/api/auth/login", data).then((result) => {
      sessionPromise = Promise.resolve(result);
      return result;
    }),
  register: (data) => securePost("/api/auth/register", data),
  logout: async () => {
    await post("/api/auth/logout");
    sessionPromise = null;
  },
  updateProfile: (data) =>
    secured("/api/me", { method: "PUT", body: JSON.stringify(data) }),
  removeAccount: async () => {
    await secured("/api/me", { method: "DELETE" });
    sessionPromise = null;
  },
  export: () => secured("/api/export"),
  history: () => secured("/api/assistant/history"),
  assistant: (message) => securePost("/api/assistant", { message }),
  practices: () => secured("/api/practices"),
  practice: (slug) => secured(`/api/practices/${slug}`),
  mark: (data) => securePost("/api/progress", data),
  goals: () => secured("/api/goals"),
  goal: (data) => securePost("/api/goals", data),
  deleteGoal: (id) => secured(`/api/goals/${id}`, { method: "DELETE" }),
  calendar: (month) => secured(`/api/calendar?month=${month}`),
  track: async (event, properties = {}) => {
    try {
      await securePost("/api/events", { event, properties });
    } catch {
      /* Analytics never blocks the product. */
    }
  },
};
export { API_BASE };
