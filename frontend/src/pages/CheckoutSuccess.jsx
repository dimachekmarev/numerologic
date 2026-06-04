import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'

export default function CheckoutSuccess() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id') || localStorage.getItem('numerologic_last_order_id')
  const [state, setState] = useState({ loading: true, result: null, error: '' })

  useEffect(() => {
    let alive = true
    if (!orderId) {
      setState({ loading: false, result: null, error: 'Order id не найден' })
      return
    }
    api.mockSuccess(orderId)
      .then((result) => {
        if (!alive) return
        localStorage.setItem('numerologic_last_payment', JSON.stringify(result))
        if (result.report_id) {
          localStorage.setItem('numerologic_last_report_id', String(result.report_id))
        }
        setState({ loading: false, result, error: '' })
      })
      .catch((error) => alive && setState({ loading: false, result: null, error: error.message }))
    return () => { alive = false }
  }, [orderId])

  return (
    <section className="narrow-page success-page">
      <article className="soft-card">
        <span className="chip sage">Success</span>
        {state.loading ? (
          <h1>Подтверждаем mock-платёж...</h1>
        ) : state.error ? (
          <>
            <h1>Не удалось подтвердить заказ</h1>
            <p>{state.error}</p>
            <Link className="secondary-button" to="/checkout">Вернуться в checkout</Link>
          </>
        ) : (
          <>
            <h1>Mock-платёж прошёл</h1>
            <p>Заказ #{state.result.order_id} отмечен как paid. Backend создал {state.result.report_id ? 'полный report' : 'подписку Numerologic Club'}.</p>
            <div className="hero-actions">
              {state.result.report_id && <Link className="primary-button" to={`/report/${state.result.report_id}`}>Открыть отчёт</Link>}
              <Link className="secondary-button" to="/dashboard">В dashboard</Link>
            </div>
          </>
        )}
      </article>
    </section>
  )
}
