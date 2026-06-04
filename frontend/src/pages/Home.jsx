import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import StickyCTA from '../components/StickyCTA'
import { products } from '../data/products'

export default function Home() {
  return (
    <>
      <section className="hero section-grid">
        <div className="hero-copy">
          <span className="eyebrow">Radiant guidance · мягкий numerology app</span>
          <h1>Личный разбор через числа без тяжёлых обещаний</h1>
          <p>
            Numerologic помогает увидеть ритм периода, повторяющиеся ситуации и точки внутренней опоры —
            в светлом Stitch-inspired интерфейсе с понятным коммерческим mock flow.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/quiz">Пройти мини-разбор</Link>
            <Link className="secondary-button" to="/products">Смотреть продукты</Link>
          </div>
        </div>
        <div className="hero-card glass-card">
          <span className="chip">Сегодня</span>
          <div className="number-orbit">
            <span>8</span>
          </div>
          <h2>Фокус на ресурсах</h2>
          <p>Мягкая рекомендация: выберите одно решение, которое даст ясность и практичный результат.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Путь пользователя</span>
          <h2>От мини-разбора до полного отчёта</h2>
        </div>
        <div className="steps-grid">
          {['Quiz 5 шагов', 'Бесплатный mini-result', 'Выбор продукта', 'Mock checkout', 'Полный report'].map((step, index) => (
            <article className="soft-card" key={step}>
              <span className="step-index">{index + 1}</span>
              <h3>{step}</h3>
              <p>Рабочий MVP-сценарий для проверки коммерческой воронки без реальных платежей.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading split">
          <div>
            <span className="eyebrow">Каталог</span>
            <h2>Популярные продукты</h2>
          </div>
          <Link className="ghost-button" to="/products">Весь каталог</Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 3).map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
      </section>
      <StickyCTA />
    </>
  )
}
