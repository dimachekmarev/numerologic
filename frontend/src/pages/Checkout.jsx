import { useI18n } from "../i18n";
import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { productBySlug, formatPrice } from "../data/products";
import { useLoad, stored, localDay } from "../hooks";
import Status from "../components/Status";
export default function Checkout() {
  const { t: tr } = useI18n();
  const navigate = useNavigate(),
    [params] = useSearchParams(),
    slug =
      params.get("product") ||
      localStorage.getItem("numerologic_checkout_product") ||
      "deep-reading",
    product = productBySlug(slug),
    quiz = stored("numerologic_quiz", {}),
    pair = stored("numerologic_partner", {}),
    me = useLoad(api.me),
    config = useLoad(api.config),
    key = useRef(crypto.randomUUID()),
    [customer, setCustomer] = useState({
      name: quiz.name || "",
      birth_date: quiz.birth_date || "",
      focus: quiz.focus || "Ясность",
    }),
    [partner, setPartner] = useState({
      name: pair.name || "",
      birth_date: pair.birth_date || "",
      focus: "Отношения",
    }),
    [consent, setConsent] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  async function pay(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      api.track("checkout_started", {
        product: slug,
      });
      const order = await api.createCheckout({
        product_slug: slug,
        addons: [],
        customer,
        partner: slug === "compatibility" ? partner : null,
        consent,
        request_key: key.current,
      });
      api.track("checkout_created", {
        product: slug,
      });
      localStorage.setItem("numerologic_last_order_id", String(order.order_id));
      if (order.mock) navigate(`/checkout/success?order_id=${order.order_id}`);
      else window.location.assign(order.checkout_url);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  if (!product)
    return (
      <section className="section">
        <h1>
          {tr(
            "\u041F\u0440\u043E\u0434\u0443\u043A\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D",
          )}
        </h1>
        <Link to="/products">
          {tr(
            "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433",
          )}
        </Link>
      </section>
    );
  const available = config.data?.payment_enabled || config.data?.test_mode;
  return (
    <section className="section-grid checkout-page">
      <form className="soft-card form-grid" onSubmit={pay}>
        <span className="eyebrow">
          {tr(
            "\u0412\u0430\u0448 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433",
          )}
        </span>
        <h1>
          {tr("\u041E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435.")}
        </h1>
        <Status {...me} />
        {tr(
          me.data && !me.data.registered && (
            <div className="notice">
              <p>
                {tr(
                  "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043A\u0443\u043F\u043A\u0430 \u0431\u044B\u043B\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u043D\u0430 \u0434\u0440\u0443\u0433\u0438\u0445 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430\u0445.",
                )}
              </p>
              <Link className="secondary-button" to="/account">
                {tr(
                  "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442",
                )}
              </Link>
            </div>
          ),
        )}
        <label>
          {tr("\u0418\u043C\u044F")}
          <input
            required
            maxLength={128}
            value={customer.name}
            onChange={(e) =>
              setCustomer({
                ...customer,
                name: e.target.value,
              })
            }
          />
        </label>
        <label>
          {tr(
            "\u0414\u0430\u0442\u0430 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F",
          )}
          <input
            required
            min="1900-01-01"
            max={localDay()}
            type="date"
            value={customer.birth_date}
            onChange={(e) =>
              setCustomer({
                ...customer,
                birth_date: e.target.value,
              })
            }
          />
        </label>
        <label>
          {tr(
            "\u0427\u0442\u043E \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043F\u0440\u043E\u044F\u0441\u043D\u0438\u0442\u044C?",
          )}
          <input
            maxLength={500}
            value={customer.focus}
            onChange={(e) =>
              setCustomer({
                ...customer,
                focus: e.target.value,
              })
            }
          />
        </label>
        {tr(
          slug === "compatibility" && (
            <>
              <h3>{tr("\u041F\u0430\u0440\u0442\u043D\u0451\u0440")}</h3>
              <label>
                {tr(
                  "\u0418\u043C\u044F \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u0430",
                )}
                <input
                  required
                  maxLength={128}
                  value={partner.name}
                  onChange={(e) =>
                    setPartner({
                      ...partner,
                      name: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                {tr(
                  "\u0414\u0430\u0442\u0430 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u0430",
                )}
                <input
                  required
                  type="date"
                  min="1900-01-01"
                  max={localDay()}
                  value={partner.birth_date}
                  onChange={(e) =>
                    setPartner({
                      ...partner,
                      birth_date: e.target.value,
                    })
                  }
                />
              </label>
            </>
          ),
        )}
        <label className="checkbox-label">
          <input
            required
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            {tr("\u0421\u043E\u0433\u043B\u0430\u0441\u0435\u043D \u0441")}
            <Link to="/terms">
              {tr(
                "\u0443\u0441\u043B\u043E\u0432\u0438\u044F\u043C\u0438 \u0437\u0430\u043A\u0430\u0437\u0430",
              )}
            </Link>
            {tr("\u0438")}
            {tr(" ")}
            <Link to="/privacy">
              {tr(
                "\u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u043E\u0439 \u0434\u0430\u043D\u043D\u044B\u0445",
              )}
            </Link>
            .
          </span>
        </label>
        {tr(
          config.data?.test_mode && (
            <p className="notice">
              {tr(
                "\u0422\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u0440\u0435\u0436\u0438\u043C: \u0434\u0435\u043D\u044C\u0433\u0438 \u043D\u0435 \u0441\u043F\u0438\u0441\u044B\u0432\u0430\u044E\u0442\u0441\u044F.",
              )}
            </p>
          ),
        )}
        {tr(
          !available && (
            <p className="notice">
              {tr(
                "\u041F\u0440\u0438\u0451\u043C \u043E\u043F\u043B\u0430\u0442\u044B \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F. \u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0435 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B.",
              )}
            </p>
          ),
        )}
        <button
          className="primary-button"
          disabled={loading || !me.data?.registered || !available}
        >
          {tr(
            loading
              ? "Готовим заказ…"
              : config.data?.test_mode
                ? "Проверить тестовую покупку"
                : `Перейти к оплате · ${formatPrice(product.price)}`,
          )}
        </button>
        {tr(
          error && (
            <p role="alert" className="error">
              {tr(error)}
            </p>
          ),
        )}
      </form>
      <aside className="soft-card order-summary feature-card">
        <span className="chip">
          {tr(
            product.category === "club" ? "30 дней доступа" : "Разовая покупка",
          )}
        </span>
        <h2>{tr(product.title)}</h2>
        <p>{tr(product.subtitle)}</p>
        <ul className="feature-list">
          {tr(product.features.map((f) => <li key={f}>{tr(f)}</li>))}
        </ul>
        <div className="summary-total">
          <span>{tr("\u0418\u0442\u043E\u0433\u043E")}</span>
          <strong>{tr(formatPrice(product.price))}</strong>
        </div>
        <p>
          {tr(
            "PDF \u0432\u043A\u043B\u044E\u0447\u0451\u043D. \u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0432 \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u0435 \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u043E\u043F\u043B\u0430\u0442\u044B.",
          )}
        </p>
        {tr(
          slug === "club" && (
            <p>
              {tr(
                "\u041F\u0440\u043E\u0434\u043B\u0435\u043D\u0438\u0435 \u0432\u0440\u0443\u0447\u043D\u0443\u044E. \u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0439 \u043D\u0435\u0442.",
              )}
            </p>
          ),
        )}
        {tr(
          config.data?.seller && (
            <small>
              {tr("\u041F\u0440\u043E\u0434\u0430\u0432\u0435\u0446:")}
              {tr(config.data.seller)}
              {tr(". \u041F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430:")}
              {tr(config.data.support)}.
            </small>
          ),
        )}
      </aside>
    </section>
  );
}
