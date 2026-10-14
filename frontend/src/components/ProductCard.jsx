import { useI18n } from "../i18n";
import { Link } from "react-router-dom";
import { formatPrice } from "../data/products";
export default function ProductCard({ product, compact = false }) {
  const { t: tr } = useI18n();
  if (!product) return null;
  return (
    <article
      className={`product-card tint-${product.tint || product.category || "peach"}`}
    >
      <div className="card-topline">
        <span className="chip">{tr(product.badge)}</span>
        <strong>{tr(formatPrice(product.price))}</strong>
      </div>
      <h3>{tr(product.title)}</h3>
      <p>{tr(product.subtitle)}</p>
      {tr(
        !compact && (
          <ul className="feature-list">
            {tr(
              product.features
                ?.slice(0, 4)
                .map((feature) => <li key={feature}>{tr(feature)}</li>),
            )}
          </ul>
        ),
      )}
      <Link
        to={
          product.category === "practice"
            ? `/practices/${product.slug}`
            : `/products/${product.slug}`
        }
        className="ghost-button"
      >
        {tr(
          "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u2197",
        )}
      </Link>
    </article>
  );
}
