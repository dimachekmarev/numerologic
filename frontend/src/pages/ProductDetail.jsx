import { useI18n } from "../i18n";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productBySlug, formatPrice } from "../data/products";
import { api } from "../api";
import { useLoad } from "../hooks";
import TrialAccess from "../components/TrialAccess";
export default function ProductDetail() {
  const { t: tr } = useI18n();
  const { slug } = useParams(),
    navigate = useNavigate(),
    product = productBySlug(slug),
    state = useLoad(api.dashboard),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (!product)
    return (
      <section className="section">
        <h1>
          {tr(
            "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D",
          )}
        </h1>
        <Link to="/products">
          {tr("\u0412 \u043A\u0430\u0442\u0430\u043B\u043E\u0433")}
        </Link>
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
          <span className="chip">{tr(product.badge)}</span>
          <h1>{tr(product.title)}</h1>
          <p className="lead">{tr(product.subtitle)}</p>
          <div className="price-line">
            {tr(access ? "В вашем доступе" : formatPrice(product.price))}
          </div>
          <button
            className="primary-button"
            disabled={busy || state.loading}
            onClick={open}
          >
            {tr(
              busy
                ? "Готовим материал…"
                : access
                  ? "Открыть материал и PDF"
                  : "Условия доступа",
            )}
          </button>
          {tr(error && <p role="alert">{tr(error)}</p>)}
        </article>
        <aside className="soft-card">
          <h2>
            {tr("\u0427\u0442\u043E \u0432\u043D\u0443\u0442\u0440\u0438")}
          </h2>
          <ul className="feature-list large">
            {tr(product.features?.map((f) => <li key={f}>{tr(f)}</li>))}
          </ul>
          <p>
            {tr(
              "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0441\u044F \u0432 \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u0435. PDF \u0432\u043A\u043B\u044E\u0447\u0451\u043D.",
            )}
          </p>
        </aside>
      </div>
      <TrialAccess onChanged={state.reload} />
    </section>
  );
}
