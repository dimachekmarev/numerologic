import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { addons, addonBySlug, formatPrice, productBySlug } from '../data/products'

export default function Checkout() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialSlug = params.get('product') || localStorage.getItem('numerologic_checkout_product') || 'deep-reading'
  const product = productBySlug(initialSlug) || productBySlug('deep-reading')
  const quiz = JSON.parse(localStorage.getItem('numerologic_quiz') || '{}')
  const [selected, setSelected] = useState(['pdf'])
  const [customer, setCustomer] = useState({
    name: quiz.name || '',
    birth_date: quiz.birth_date || '',
    email: quiz.email || '',
    focus: quiz.focus || 'Ясность',
  })
  const [loading, setLoading] = useState(false)

  const total = useMemo(() => product.price + selected.reduce((sum, slug) => sum + (addonBySlug(slug)?.price || 0), 0), [product, selected])

  function toggle(slug) {
    setSelected((items) => (items.includes(slug) ? items.filter((item) => item !== slug) : [...items, slug]))
  }

  async function pay(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const checkout = await api.createCheckout({ product_slug: product.slug, addons: selected, customer })
      localStorage.setItem('numerologic_last_order_id', String(checkout.order_id))
      if (checkout.mock) {
        navigate(`/checkout/success?order_id=${checkout.order_id}`)
      } else {
        window.location.href = checkout.checkout_url
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="checkout-page section-grid">
      <form className="soft-card" onSubmit={pay}>
        <span className="eyebrow">Mock checkout</span>
        <h1>Оформление</h1>
        <input required placeholder="Имя" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
        <input required type="date" value={customer.birth_date} onChange={(event) => setCustomer({ ...customer, birth_date: event.target.value })} />
        <input type="email" placeholder="Email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
        <input placeholder="Фокус запроса" value={customer.focus} onChange={(event) => setCustomer({ ...customer, focus: event.target.value })} />
        <h2>Дополнения</h2>
        <div className="addons-list">
          {addons.map((addon) => (
            <label className="addon-row" key={addon.slug}>
              <input type="checkbox" checked={selected.includes(addon.slug)} onChange={() => toggle(addon.slug)} />
              <span>{addon.title}</span>
              <b>{formatPrice(addon.price)}</b>
            </label>
          ))}
        </div>
        <button className="primary-button" disabled={loading}>{loading ? 'Создаю заказ...' : 'Оплатить в mock mode'}</button>
      </form>
      <aside className="soft-card order-summary">
        <span className="chip">Заказ</span>
        <h2>{product.title}</h2>
        <p>{product.subtitle}</p>
        <div className="summary-row"><span>Продукт</span><b>{formatPrice(product.price)}</b></div>
        {selected.map((slug) => <div className="summary-row" key={slug}><span>{addonBySlug(slug)?.title}</span><b>{formatPrice(addonBySlug(slug)?.price || 0)}</b></div>)}
        <div className="summary-total"><span>Итого</span><strong>{formatPrice(total)}</strong></div>
        <p className="small-note">Реальные ключи оплаты не требуются: backend создаёт order pending, затем `/checkout/success` вызывает mock-success.</p>
      </aside>
    </section>
  )
}
