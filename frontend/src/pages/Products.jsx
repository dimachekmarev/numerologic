import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { api } from '../api'
import { products as fallbackProducts } from '../data/products'

export default function Products() {
  const [catalog, setCatalog] = useState(fallbackProducts)
  const [active, setActive] = useState('all')

  useEffect(() => {
    api.products().then((data) => setCatalog(data.products || fallbackProducts))
  }, [])

  const filtered = active === 'all' ? catalog : catalog.filter((product) => product.category === active)
  const chips = [
    ['all', 'Все'],
    ['personal', 'Личное'],
    ['relationship', 'Отношения'],
    ['forecast', 'Период'],
    ['work', 'Работа'],
    ['club', 'Клуб'],
  ]

  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">Products catalog</span>
        <h1>Выберите формат разбора</h1>
        <p>Цены и состав продуктов живут в `frontend/src/data/products.js` и backend config.</p>
      </div>
      <div className="chips-row">
        {chips.map(([key, label]) => (
          <button key={key} className={`chip-button ${active === key ? 'active' : ''}`} onClick={() => setActive(key)}>{label}</button>
        ))}
      </div>
      <div className="product-grid">
        {filtered.map((product) => <ProductCard key={product.slug} product={product} />)}
      </div>
    </section>
  )
}
