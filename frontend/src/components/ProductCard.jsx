import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'

export default function ProductCard({ product, compact = false }) {
  if (!product) return null
  return (
    <article className={`product-card tint-${product.tint || product.category || 'peach'}`}>
      <div className="card-topline">
        <span className="chip">{product.badge}</span>
        <strong>{formatPrice(product.price)}</strong>
      </div>
      <h3>{product.title}</h3>
      <p>{product.subtitle}</p>
      {!compact && (
        <ul className="feature-list">
          {product.features?.slice(0, 4).map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}
      <Link to={`/products/${product.slug}`} className="card-link">
        Подробнее
      </Link>
    </article>
  )
}
