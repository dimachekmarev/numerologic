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
    <section className="result-page section-grid">
      <div className="soft-card result-summary">
        <span className="chip">Бесплатный мини-разбор</span>
        <h1>{mini.headline}</h1>
        <p className="lead">{mini.summary}</p>
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
        <p className="small-note">{stored.profile.arithmetic}</p>
        <div className="hero-actions">
          <Link className="primary-button" to="/numbers">
            Полная карта чисел ↗
          </Link>
          <Link className="secondary-button" to="/today">
            Моя тема дня
          </Link>
        </div>
        <p>
          Фокус запроса: <b>{quiz?.focus || mini.focus}</b>
        </p>
      </div>
      <div className="soft-card locked-card">
        <span className="eyebrow">Полный отчёт</span>
        <h2>Внутри ещё 4 закрытые секции</h2>
        {miniReportSections.map((section) => (
          <div key={section.title} className="mini-section">
            <h3>{section.title}</h3>
            <ul className="feature-list">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="recommended-product">
          <span className="chip sage">Рекомендация</span>
          <h3>{recommended?.title || "Глубокий разбор"}</h3>
          <p>{recommended?.subtitle}</p>
          <button className="primary-button" onClick={startCheckout}>
            Открыть полный материал
          </button>
        </div>
      </div>
    </section>
  );
}
