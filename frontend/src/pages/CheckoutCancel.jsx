import { Link } from 'react-router-dom'

export default function CheckoutCancel() {
  return (
    <section className="narrow-page empty-state">
      <h1>Checkout отменён</h1>
      <p>Заказ не оплачен. Можно вернуться к продуктам или повторить mock checkout.</p>
      <div className="hero-actions">
        <Link className="primary-button" to="/checkout">Повторить</Link>
        <Link className="secondary-button" to="/products">В каталог</Link>
      </div>
    </section>
  )
}
