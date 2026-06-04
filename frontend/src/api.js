import { addons, addonBySlug, productBySlug, products } from './data/products'
import { calculateProfile } from './utils/numerology'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const SESSION_KEY = 'numerologic_session_id'

export function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() || `session-${Date.now()}`
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `API error ${response.status}`)
  }
  return response.json()
}

function localQuizResult(payload) {
  const profile = calculateProfile(payload.name, payload.birth_date)
  return {
    session_id: getSessionId(),
    profile,
    mini_result: {
      headline: `${payload.name || 'Вы'}, ваш базовый код — ${profile.life_path}`,
      summary: profile.meaning,
      focus: payload.focus || 'Ясность',
      locked_sections: ['отношения', 'деньги и реализация', 'период жизни'],
      recommended_product: productBySlug(payload.focus === 'Отношения' ? 'compatibility' : 'deep-reading'),
    },
  }
}

function buildLocalReport({ id, product, customer, selectedAddons = [] }) {
  const profile = calculateProfile(customer?.name || 'Гость Numerologic', customer?.birth_date || '1992-05-14')
  const addonTitles = selectedAddons.map((slug) => addonBySlug(slug)?.title).filter(Boolean)
  return {
    id,
    report_type: product.slug,
    title: `${product.title} — демо-отчёт`,
    generated_at: new Date().toISOString(),
    content: `${product.title}\n\n${customer?.name || 'Гость'}, ваш жизненный путь: ${profile.life_path} — ${profile.meaning}.\n\nФокус запроса: ${customer?.focus || 'ясность и внутренняя опора'}.\n\nЧто показывает этот отчёт:\n• личный ритм и текущий период;\n• сильные стороны и где уходит энергия;\n• мягкие рекомендации по отношениям, деньгам и решениям;\n• сценарии, к которым можно возвращаться без давления.\n\nДобавлено к заказу: ${addonTitles.length ? addonTitles.join(', ') : 'без дополнений'}.\n\nЭто demo/mock отчёт для проверки продажи и интерфейса. Для реального продукта подключите backend и оплату.`,
  }
}

function localCreateCheckout(payload) {
  const product = productBySlug(payload.product_slug) || productBySlug('deep-reading')
  const selectedAddons = payload.addons || []
  const total = product.price + selectedAddons.reduce((sum, slug) => sum + (addonBySlug(slug)?.price || 0), 0)
  const orderId = Date.now()
  const order = {
    order_id: orderId,
    status: 'pending',
    total_amount: total,
    currency: 'RUB',
    provider: 'local-mock',
    payment_id: `local_${orderId}`,
    checkout_url: `/checkout/success?order_id=${orderId}&mock=1`,
    mock: true,
    product,
    addons: selectedAddons,
    customer: payload.customer || {},
  }
  localStorage.setItem(`numerologic_order_${orderId}`, JSON.stringify(order))
  return order
}

function localMockSuccess(orderId) {
  const order = JSON.parse(localStorage.getItem(`numerologic_order_${orderId}`) || 'null')
  if (!order) throw new Error('Local order not found')
  const reportId = Number(orderId)
  const report = buildLocalReport({ id: reportId, product: order.product, customer: order.customer, selectedAddons: order.addons })
  localStorage.setItem(`numerologic_report_${reportId}`, JSON.stringify(report))
  const reports = JSON.parse(localStorage.getItem('numerologic_reports') || '[]')
  if (!reports.some((item) => Number(item.id) === reportId)) {
    localStorage.setItem('numerologic_reports', JSON.stringify([report, ...reports].slice(0, 12)))
  }
  return { status: 'paid', order_id: Number(orderId), report_id: reportId, redirect_url: `/report/${reportId}`, local: true }
}

function localReport(id) {
  const report = JSON.parse(localStorage.getItem(`numerologic_report_${id}`) || 'null')
  if (report) return report
  const reports = JSON.parse(localStorage.getItem('numerologic_reports') || '[]')
  const found = reports.find((item) => String(item.id) === String(id))
  if (found) return found
  throw new Error('Отчёт не найден локально')
}

export const api = {
  products: async () => {
    try {
      return await request('/api/products')
    } catch {
      return { products, addons, payment_provider: 'local-fallback' }
    }
  },
  product: async (slug) => {
    try {
      return await request(`/api/products/${slug}`)
    } catch {
      return { product: productBySlug(slug), addons }
    }
  },
  completeQuiz: async (payload) => {
    const body = { session_id: getSessionId(), ...payload }
    try {
      return await request('/api/quiz/complete', { method: 'POST', body: JSON.stringify(body) })
    } catch {
      return localQuizResult(payload)
    }
  },
  previewReport: async (payload) => {
    try {
      return await request('/api/reports/preview', { method: 'POST', body: JSON.stringify({ session_id: getSessionId(), ...payload }) })
    } catch {
      return buildLocalReport({ id: Date.now(), product: productBySlug(payload.product_slug || 'deep-reading'), customer: payload.customer || payload })
    }
  },
  createCheckout: async (payload) => {
    try {
      return await request('/api/checkout/create', { method: 'POST', body: JSON.stringify({ session_id: getSessionId(), ...payload }) })
    } catch {
      return localCreateCheckout(payload)
    }
  },
  mockSuccess: async (orderId) => {
    try {
      return await request('/api/checkout/mock-success', {
        method: 'POST',
        body: JSON.stringify({ order_id: Number(orderId), session_id: getSessionId() }),
      })
    } catch {
      return localMockSuccess(orderId)
    }
  },
  createSubscription: async (payload) => {
    try {
      return await request('/api/subscriptions/create', { method: 'POST', body: JSON.stringify({ session_id: getSessionId(), ...payload }) })
    } catch {
      return { status: 'active', plan: payload.plan || 'club', local: true }
    }
  },
  compatibilityPreview: async (payload) => {
    try {
      return await request('/api/compatibility/preview', { method: 'POST', body: JSON.stringify({ session_id: getSessionId(), ...payload }) })
    } catch {
      const a = calculateProfile(payload.name_a, payload.birth_date_a)
      const b = calculateProfile(payload.name_b, payload.birth_date_b)
      return {
        session_id: getSessionId(),
        profile_a: a,
        profile_b: b,
        resonance: ((a.life_path + b.life_path - 1) % 9) + 1,
        summary: `Ваша динамика строится на сочетании ${a.life_path} и ${b.life_path}: важно не угадывать чувства, а договариваться мягко и прямо.`,
        locked: ['полная динамика пары', 'триггеры диалога', 'практики сближения'],
        recommended_product: productBySlug('compatibility'),
      }
    }
  },
  report: async (id) => {
    try {
      return await request(`/api/reports/${id}`)
    } catch {
      return localReport(id)
    }
  },
  dashboard: async () => request('/api/dashboard'),
}

export { API_BASE }
