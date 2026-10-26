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
  const isClub = product.category === "club";

  return (
    <section className="section checkout-section">
      <div className="checkout-header">
        <span className="eyebrow">Безопасная оплата</span>
        <h1>Оформление заказа</h1>
        <div className="checkout-trust-badges">
          <div className="trust-badge">
            <span>🔒</span>
            <small>Безопасная оплата</small>
          </div>
          <div className="trust-badge">
            <span>🛡</span>
            <small>Гарантия возврата</small>
          </div>
          <div className="trust-badge">
            <span>⚡</span>
            <small>Мгновенный доступ</small>
          </div>
        </div>
      </div>

      <div className="section-grid checkout-page">
        <form className="soft-card form-grid checkout-form" onSubmit={pay}>
          <Status {...me} />
          
          {me.data && !me.data.registered && (
            <div className="notice checkout-notice">
              <span className="notice-icon">👤</span>
              <div>
                <strong>Сохраните аккаунт перед покупкой</strong>
                <p>Чтобы покупка была доступна на других устройствах и не потерялась.</p>
              </div>
              <Link className="secondary-button" to="/account">
                Сохранить аккаунт
              </Link>
            </div>
          )}

          <div className="form-section">
            <h2>Ваши данные</h2>
            <label>
              Имя
              <input
                required
                maxLength={128}
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Как к вам обращаться?"
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
                placeholder="Ваш фокус запроса"
              />
            </label>
          </div>

          {slug === "compatibility" && (
            <div className="form-section">
              <h2>Партнёр</h2>
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
            </div>
          )}

          <div className="form-section">
            <label className="checkbox-label consent-label">
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
          </div>

          {config.data?.test_mode && (
            <div className="notice test-mode">
              <span className="notice-icon">⚠️</span>
              <div>
                <strong>Тестовый режим</strong>
                <p>Деньги не списываются. Это демонстрация процесса оплаты.</p>
              </div>
            </div>
          )}

          {!available && (
            <div className="notice payment-unavailable">
              <span className="notice-icon">💳</span>
              <div>
                <strong>Приём оплаты подключается</strong>
                <p>Бесплатные инструменты доступны. Попробуйте 7 дней клуба бесплатно.</p>
              </div>
            </div>
          )}

          <button
            className="primary-button cta-primary cta-large checkout-button"
            disabled={loading || !me.data?.registered || !available}
          >
            {loading ? (
              <>
                <span className="loading-spinner">⏳</span>
                Готовим заказ…
              </>
            ) : config.data?.test_mode ? (
              <>Проверить тестовую покупку →</>
            ) : (
              <>
                Перейти к оплате · {formatPrice(product.price)}
                <span className="cta-arrow">→</span>
              </>
            )}
          </button>

          {error && (
            <p role="alert" className="error checkout-error">
              {error}
            </p>
          )}

          <div className="checkout-guarantees">
            <div className="guarantee-item">
              <span>🔒</span>
              <small>Данные защищены шифрованием</small>
            </div>
            <div className="guarantee-item">
              <span>🛡</span>
              <small>Возврат в течение 14 дней</small>
            </div>
            <div className="guarantee-item">
              <span>⚡</span>
              <small>Доступ сразу после оплаты</small>
            </div>
          </div>
        </form>

        <aside className="soft-card order-summary">
          <span className="chip">
            {isClub ? "30 дней доступа" : "Разовая покупка"}
          </span>
          <h2>{product.title}</h2>
          <p className="order-subtitle">{product.subtitle}</p>
          
          <div className="order-features">
            <h3>Что включено:</h3>
            <ul className="feature-list">
              {product.features.map((f) => (
                <li key={f}>
                  <span className="feature-check">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {isClub && (
            <div className="order-bonus">
              <span className="bonus-icon">🎁</span>
              <div>
                <strong>Бонус: 7 дней бесплатно</strong>
                <small>Попробуйте всё без ограничений</small>
              </div>
            </div>
          )}

          <div className="summary-total">
            <span>Итого</span>
            <strong>{formatPrice(product.price)}</strong>
          </div>

          <div className="order-notes">
            <p>
              {isClub 
                ? "Продление вручную. Автоматических списаний нет." 
                : "PDF включён. Материал появится в кабинете после подтверждения оплаты."}
            </p>
            {isClub && (
              <p className="order-highlight">
                Первые 7 дней — бесплатно. Платите только если понравится.
              </p>
            )}
          </div>

          {config.data?.seller && (
            <div className="order-seller">
              <small>
                Продавец: {config.data.seller}<br />
                Поддержка: {config.data.support}
              </small>
            </div>
          )}
        </aside>
      </div>

      {/* FAQ SECTION */}
      <div className="checkout-faq">
        <h2>Частые вопросы</h2>
        <div className="checkout-faq-grid">
          <details className="soft-card">
            <summary>Как быстро получу доступ?</summary>
            <p>Сразу после оплаты. Материал появится в кабинете, PDF можно скачать.</p>
          </details>
          <details className="soft-card">
            <summary>Можно ли вернуть деньги?</summary>
            <p>Да, в течение 14 дней. Напишите в поддержку — вернём без вопросов.</p>
          </details>
          <details className="soft-card">
            <summary>Безопасна ли оплата?</summary>
            <p>Да. Платёж обрабатывается сертифицированным провайдером с шифрованием.</p>
          </details>
          <details className="soft-card">
            <summary>Что если не понравится?</summary>
            <p>Попробуйте 7 дней бесплатно в клубе. Или верните покупку в течение 14 дней.</p>
          </details>
        </div>
      </div>
    </section>
  );
}
