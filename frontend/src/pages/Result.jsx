import { Link, useNavigate } from "react-router-dom";
import { stored as readStored } from "../hooks";
import { miniReportSections } from "../data/reportTemplates";

export default function Result() {
  const navigate = useNavigate();
  const stored = readStored("numerologic_result");
  const quiz = readStored("numerologic_quiz");
  const mini = stored?.mini_result;
  const recommended = mini?.recommended_product;

  if (!stored || !mini) {
    return (
      <section className="narrow-page empty-state">
        <h1>Сначала пройдите мини-разбор</h1>
        <Link className="primary-button" to="/quiz">
          Начать мини-разбор
        </Link>
      </section>
    );
  }

  function startCheckout() {
    localStorage.setItem(
      "numerologic_checkout_product",
      recommended?.slug || "deep-reading",
    );
    navigate("/checkout");
  }

  return (
    <section className="result-page section">
      {/* CELEBRATION */}
      <div className="result-celebration">
        <span className="celebration-icon">✦</span>
        <h1>Ваш ритм найден</h1>
        <p>{mini.headline}</p>
      </div>

      <div className="result-grid">
        {/* LEFT: FREE RESULT */}
        <div className="soft-card result-summary">
          <span className="chip sage">✓ Бесплатный результат</span>
          <h2>{mini.summary}</h2>
          <div className="numbers-row">
            <div>
              <strong>{stored.profile.life_path}</strong>
              <span>путь</span>
            </div>
            <div>
              <strong>{stored.profile.destiny}</strong>
              <span>имя</span>
            </div>
            <div>
              <strong>{stored.profile.month}</strong>
              <span>месяц</span>
            </div>
          </div>
          <p className="arithmetic">{stored.profile.arithmetic}</p>
          <p className="result-focus">
            Ваш фокус: <b>{quiz?.focus || mini.focus}</b>
          </p>
          <div className="hero-actions">
            <Link className="primary-button cta-primary" to="/numbers">
              Полная карта чисел →
            </Link>
            <Link className="secondary-button" to="/today">
              Моя тема дня
            </Link>
          </div>
        </div>

        {/* RIGHT: UPSELL */}
        <div className="soft-card locked-card upsell-card">
          <div className="upsell-header">
            <span className="chip">Рекомендация под ваш запрос</span>
            <h2>{recommended?.title || "Глубокий разбор"}</h2>
            <p className="upsell-subtitle">{recommended?.subtitle}</p>
          </div>

          <div className="upsell-value">
            <h3>Внутри ещё {miniReportSections.length} закрытых секции:</h3>
            {miniReportSections.map((section, i) => (
              <div key={section.title} className="upsell-section">
                <div className="upsell-section-header">
                  <span className="upsell-number">{i + 1}</span>
                  <h4>{section.title}</h4>
                  <span className="lock-icon">🔒</span>
                </div>
                <ul className="feature-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="upsell-cta">
            <div className="upsell-price">
              <span className="price-label">Разовая покупка</span>
              <span className="price-amount">
                {recommended?.price ? `${recommended.price} ₽` : "от 990 ₽"}
              </span>
              <span className="price-note">PDF включён · навсегда в кабинете</span>
            </div>
            <button className="primary-button cta-primary cta-large" onClick={startCheckout}>
              Открыть полный материал →
            </button>
            <p className="upsell-guarantee">
              🛡 7 дней бесплатно в клубе · без карты · без автосписаний
            </p>
          </div>
        </div>
      </div>

      {/* NEXT STEPS */}
      <div className="result-next-steps">
        <h2>Что делать дальше</h2>
        <div className="next-steps-grid">
          <Link to="/journal" className="soft-card next-step-card">
            <span className="next-icon">📝</span>
            <h3>Запишите первую мысль</h3>
            <p>2 минуты в дневнике — и вы уже замечаете паттерны</p>
            <span className="step-cta">Начать запись →</span>
          </Link>
          <Link to="/practices" className="soft-card next-step-card">
            <span className="next-icon">🎯</span>
            <h3>Попробуйте практику</h3>
            <p>Первый день бесплатно: границы, ясность или диалог</p>
            <span className="step-cta">Выбрать практику →</span>
          </Link>
          <Link to="/club" className="soft-card next-step-card">
            <span className="next-icon">✦</span>
            <h3>7 дней всё включено</h3>
            <p>Все материалы, практики и AI — бесплатно на неделю</p>
            <span className="step-cta">Попробовать клуб →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
