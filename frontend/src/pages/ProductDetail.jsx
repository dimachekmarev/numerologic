import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productBySlug, formatPrice } from "../data/products";
import { api } from "../api";
import { useLoad } from "../hooks";
import TrialAccess from "../components/TrialAccess";
export default function ProductDetail() {
  const { slug } = useParams(),
    navigate = useNavigate(),
    product = productBySlug(slug),
    state = useLoad(api.dashboard),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (!product)
    return (
      <section className="section">
        <h1>Материал не найден</h1>
        <Link to="/products">В каталог</Link>
      </section>
    );
  const access = state.data?.club || state.data?.trial.active;
  async function open() {
    if (slug === "club") {
      navigate("/club");
      return;
    }
    if (slug === "compatibility") {
      navigate("/compatibility");
      return;
    }
    if (!access) {
      navigate("/checkout?product=" + slug);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await api.material(slug);
      navigate("/report/" + r.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section">
      <div className="product-detail section-grid">
        <article
          className={`soft-card feature-card tint-${product.tint || product.category}`}
        >
          <span className="chip">{product.badge}</span>
          <h1>{product.title}</h1>
          <p className="lead">{product.subtitle}</p>
          <div className="price-line">
            {access ? "В вашем доступе" : formatPrice(product.price)}
          </div>
          <button
            className="primary-button"
            disabled={busy || state.loading}
            onClick={open}
          >
            {busy
              ? "Готовим материал…"
              : access
                ? "Открыть материал и PDF"
                : "Условия доступа"}
          </button>
          {error && <p role="alert">{error}</p>}
        </article>
        <aside className="soft-card">
          <h2>Что внутри</h2>
          <ul className="feature-list large">
            {product.features?.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p>Персональный материал сохранится в кабинете. PDF включён.</p>
        </aside>
      </div>
      <TrialAccess onChanged={state.reload} />
    </section>
  );
}
