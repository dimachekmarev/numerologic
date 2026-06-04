import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { productBySlug, formatPrice } from '../data/products'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(productBySlug(slug))

  useEffect(() => {
    api.product(slug).then((data) => setProduct(data.product || productBySlug(slug)))
  }, [slug])

  if (!product) return <section className="narrow-page empty-state"><h1>Продукт не найден</h1><Link to="/products">В каталог</Link></section>

  function buy() {
    localStorage.setItem('numerologic_checkout_product', product.slug)
    navigate('/checkout')
  }

  return (
    <section className="product-detail section-grid">
      <article className={`soft-card tint-${product.tint || product.category}`}>
        <span className="chip">{product.badge}</span>
        <h1>{product.title}</h1>
        <p className="lead">{product.subtitle}</p>
        <div className="price-line">{formatPrice(product.price)}</div>
        <button className="primary-button" onClick={buy}>Оформить в mock checkout</button>
      </article>
      <aside className="soft-card">
        <h2>Что внутри</h2>
        <ul className="feature-list large">
          {product.features?.map((feature) => <li key={feature}>{feature}</li>)}
        </ul>
        <p>После успешного mock-платежа backend создаёт заказ, отмечает его paid и генерирует report.</p>
      </aside>
    </section>
  )
}
