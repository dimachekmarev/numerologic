import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { productBySlug, formatPrice } from "../data/products";
import { useLoad, stored, localDay } from "../hooks";
import Status from "../components/Status";
export default function Checkout() {
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
      api.track("checkout_started", { product: slug });
      const order = await api.createCheckout({
        product_slug: slug,
        addons: [],
        customer,
        partner: slug === "compatibility" ? partner : null,
        consent,
        request_key: key.current,
      });
      api.track("checkout_created", { product: slug });
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
        <h1>Продукт не найден</h1>
        <Link to="/products">Вернуться в каталог</Link>
      </section>
    );
  const available = config.data?.payment_enabled || config.data?.test_mode;
  return (
    <section className="section-grid checkout-page">
      <form className="soft-card form-grid" onSubmit={pay}>
        <span className="eyebrow">Ваш следующий шаг</span>
        <h1>Оформление.</h1>
        <Status {...me} />
        {me.data && !me.data.registered && (
          <div className="notice">
            <p>
              Сначала сохраните аккаунт, чтобы покупка была доступна на других
              устройствах.
            </p>
            <Link className="secondary-button" to="/account">
              Сохранить аккаунт
            </Link>
          </div>
        )}
        <label>
          Имя
          <input
            required
            maxLength={128}
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
        </label>
        <label>
          Дата рождения
          <input
            required
            min="1900-01-01"
            max={localDay()}
            type="date"
            value={customer.birth_date}
            onChange={(e) =>
              setCustomer({ ...customer, birth_date: e.target.value })
            }
          />
        </label>
        <label>
          Что хочется прояснить?
          <input
            maxLength={500}
            value={customer.focus}
            onChange={(e) =>
              setCustomer({ ...customer, focus: e.target.value })
            }
          />
        </label>
        {slug === "compatibility" && (
          <>
            <h3>Партнёр</h3>
            <label>
              Имя партнёра
              <input
                required
                maxLength={128}
                value={partner.name}
                onChange={(e) =>
                  setPartner({ ...partner, name: e.target.value })
                }
              />
            </label>
            <label>
              Дата рождения партнёра
              <input
                required
                type="date"
                min="1900-01-01"
                max={localDay()}
                value={partner.birth_date}
                onChange={(e) =>
                  setPartner({ ...partner, birth_date: e.target.value })
                }
              />
            </label>
          </>
        )}
        <label className="checkbox-label">
          <input
            required
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Согласен с <Link to="/terms">условиями заказа</Link> и{" "}
            <Link to="/privacy">обработкой данных</Link>.
          </span>
        </label>
        {config.data?.test_mode && (
          <p className="notice">Тестовый режим: деньги не списываются.</p>
        )}
        {!available && (
          <p className="notice">
            Приём оплаты подключается. Бесплатные инструменты доступны.
          </p>
        )}
        <button
          className="primary-button"
          disabled={loading || !me.data?.registered || !available}
        >
          {loading
            ? "Готовим заказ…"
            : config.data?.test_mode
              ? "Проверить тестовую покупку"
              : `Перейти к оплате · ${formatPrice(product.price)}`}
        </button>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </form>
      <aside className="soft-card order-summary feature-card">
        <span className="chip">
          {product.category === "club" ? "30 дней доступа" : "Разовая покупка"}
        </span>
        <h2>{product.title}</h2>
        <p>{product.subtitle}</p>
        <ul className="feature-list">
          {product.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <div className="summary-total">
          <span>Итого</span>
          <strong>{formatPrice(product.price)}</strong>
        </div>
        <p>
          PDF включён. Материал появится в кабинете после подтверждения оплаты.
        </p>
        {slug === "club" && (
          <p>Продление вручную. Автоматических списаний нет.</p>
        )}
        {config.data?.seller && (
          <small>
            Продавец: {config.data.seller}. Поддержка: {config.data.support}.
          </small>
        )}
      </aside>
    </section>
  );
}
