import { Link, useNavigate, useParams } from "react-router-dom";
import { productBySlug, formatPrice } from "../data/products";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = productBySlug(slug);

  if (!product)
    return (
      <section className="narrow-page empty-state">
        <h1>Продукт не найден</h1>
        <Link to="/products">В каталог</Link>
      </section>
    );

  function buy() {
    localStorage.setItem("numerologic_checkout_product", product.slug);
    navigate("/checkout");
  }

  return (
    <section className="product-detail section-grid">
      <article
        className={`soft-card feature-card tint-${product.tint || product.category}`}
      >
        <span className="chip">{product.badge}</span>
        <h1>{product.title}</h1>
        <p className="lead">{product.subtitle}</p>
        <div className="price-line">{formatPrice(product.price)}</div>
        <button className="primary-button" onClick={buy}>
          Открыть материал
        </button>
      </article>
      <aside className="soft-card">
        <h2>Что внутри</h2>
        <ul className="feature-list large">
          {product.features?.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p>
          Материал появится в вашем кабинете после подтверждения оплаты. PDF
          включён.
        </p>
      </aside>
    </section>
  );
}
