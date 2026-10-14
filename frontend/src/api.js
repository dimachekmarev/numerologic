const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
let sessionPromise;
export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    signal: options.signal || AbortSignal.timeout(20000),
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": localStorage.getItem("numerologic_language") || "ru",
      "X-Numerologic-Client": "web",
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    const error = new Error(
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((x) => x.msg).join("; ")
          : "Сервис недоступен. Попробуйте ещё раз.",
    );
    error.status = response.status;
    throw error;
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
  try {
    return await request(path, options);
  } catch (error) {
    if (error.status === 401) {
      sessionPromise = null;
      await ensureSession();
      return request(path, options);
    }
    throw error;
  }
}
function securePost(path, data) {
  return secured(path, { method: "POST", body: JSON.stringify(data) });
}
export const api = {
  rituals: () => secured("/api/rituals"),
  habit: (data) => securePost("/api/habits", data),
  habitMark: (data) => securePost("/api/habits/check", data),
  deleteHabit: (id) => secured(`/api/habits/${id}`, { method: "DELETE" }),
  monthly: (month) => secured(`/api/monthly?month=${month}`),
  marketing: () => request("/api/marketing/campaigns"),
  myEvents: () => secured("/api/marketing/metrics"),
  trial: () => securePost("/api/trial", {}),
  material: (slug, partner) => securePost("/api/materials", { slug, partner }),
  weekly: () => secured("/api/weekly"),
  reflection: (focus) => securePost("/api/reflection", { focus }),
  journals: (page = 1, search = "") =>
    secured(`/api/journal?page=${page}&search=${encodeURIComponent(search)}`),
  journalDay: (day) => secured(`/api/journal/${day}`),
  deleteJournal: (day) => secured(`/api/journal/${day}`, { method: "DELETE" }),
  recoveryCode: (password) =>
    securePost("/api/auth/recovery-code", { password }),
  changePassword: (data) => securePost("/api/auth/change-password", data),
  resetPassword: (data) =>
    post("/api/auth/reset-password", data).then((result) => {
      sessionPromise = Promise.resolve(result);
      return result;
    }),
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
      for (const key of Object.keys(localStorage))
        if (key.startsWith("numerologic_") && key !== "numerologic_language")
          localStorage.removeItem(key);
      for (const key of Object.keys(sessionStorage))
        if (key.startsWith("numerologic_")) sessionStorage.removeItem(key);
      return result;
    }),
  register: (data) =>
    securePost("/api/auth/register", data).then((result) => {
      sessionPromise = Promise.resolve(result);
      return result;
    }),
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
      let attribution = {};
      try {
        const params = new URLSearchParams(window.location.search);
        for (const k of [
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_content",
          "ref",
        ])
          if (params.get(k)) attribution[k] = params.get(k).slice(0, 100);
        if (Object.keys(attribution).length)
          sessionStorage.setItem(
            "numerologic_attribution",
            JSON.stringify(attribution),
          );
        else
          attribution = JSON.parse(
            sessionStorage.getItem("numerologic_attribution") || "{}",
          );
      } catch {
        // Optional attribution must not block the request.
      }
      await securePost("/api/events", {
        event,
        properties: {
          ...attribution,
          locale: localStorage.getItem("numerologic_language") || "ru",
          ...properties,
        },
      });
    } catch {
      /* Analytics never blocks the product. */
    }
  },
};
export { API_BASE };
