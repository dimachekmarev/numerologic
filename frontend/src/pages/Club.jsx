import { useNavigate } from 'react-router-dom'

export default function Club() {
  const navigate = useNavigate()
  function subscribe() {
    localStorage.setItem('numerologic_checkout_product', 'club')
    navigate('/checkout')
  }
  return (
    <section className="club-page section-grid">
      <div className="hero-copy">
        <span className="eyebrow">Numerologic Club</span>
        <h1>Ежемесячная поддержка в мягком формате</h1>
        <p>Мини-прогнозы, практики для ясности, архив отчётов и скидки на персональные разборы.</p>
        <button className="primary-button" onClick={subscribe}>Оформить mock subscription · 690 ₽</button>
      </div>
      <div className="soft-card premium-card">
        <span className="chip sage">Club</span>
        <h2>Что входит</h2>
        <ul className="feature-list large">
          <li>ежемесячный отчёт по периоду жизни</li>
          <li>короткие практики для внутренней опоры</li>
          <li>скидки на совместимость и глубокий разбор</li>
          <li>личный dashboard с историей reports</li>
        </ul>
      </div>
    </section>
  )
}
