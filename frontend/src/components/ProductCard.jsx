import { Link } from "react-router-dom";
import { formatPrice } from "../data/products";

export default function ProductCard({ product, compact = false }) {
  if (!product) return null;
  const isPractice = product.category === "practice";
  const to = isPractice
    ? `/practices/${product.slug}`
    : `/products/${product.slug}`;

  return (
    <Link to={to} className="product-card-v2">
      <article className={`product-card tint-${product.tint || product.category || "peach"}`}>
        <div className="card-topline">
          <span className="chip">{product.badge}</span>
          <strong className="card-price">{formatPrice(product.price)}</strong>
        </div>
        <h3>{product.title}</h3>
        <p>{product.subtitle}</p>
        {!compact && (
          <ul className="feature-list">
            {product.features?.slice(0, 4).map((feature) => (
              <li key={feature}>
                <span className="feature-check">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        )}
        <div className="card-footer">
          <span className="card-cta">
            {isPractice ? "Первый день бесплатно →" : "Посмотреть материал →"}
          </span>
        </div>
      </article>
    </Link>
  );
}
