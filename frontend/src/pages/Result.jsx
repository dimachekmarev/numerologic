import { useI18n } from "../i18n";
import { Link, useNavigate } from "react-router-dom";
import { stored as readStored } from "../hooks";
import { miniReportSections } from "../data/reportTemplates";
export default function Result() {
  const { t: tr } = useI18n();
  const navigate = useNavigate();
  const stored = readStored("numerologic_result");
  const quiz = readStored("numerologic_quiz");
  const mini = stored?.mini_result;
  const recommended = mini?.recommended_product;
  if (!stored || !mini) {
    return (
      <section className="narrow-page empty-state">
        <h1>
          {tr(
            "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u0440\u043E\u0439\u0434\u0438\u0442\u0435 \u043C\u0438\u043D\u0438-\u0440\u0430\u0437\u0431\u043E\u0440",
          )}
        </h1>
        <Link className="primary-button" to="/quiz">
          {tr(
            "\u041D\u0430\u0447\u0430\u0442\u044C \u043C\u0438\u043D\u0438-\u0440\u0430\u0437\u0431\u043E\u0440",
          )}
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
        <span className="chip">
          {tr(
            "\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0439 \u043C\u0438\u043D\u0438-\u0440\u0430\u0437\u0431\u043E\u0440",
          )}
        </span>
        <h1>{tr(mini.headline)}</h1>
        <p className="lead">{tr(mini.summary)}</p>
        <div className="numbers-row">
          <div>
            <strong>{tr(stored.profile.life_path)}</strong>
            <span>{tr("\u043F\u0443\u0442\u044C")}</span>
          </div>
          <div>
            <strong>{tr(stored.profile.destiny)}</strong>
            <span>{tr("\u0438\u043C\u044F")}</span>
          </div>
          <div>
            <strong>{tr(stored.profile.month)}</strong>
            <span>{tr("\u043C\u0435\u0441\u044F\u0446")}</span>
          </div>
        </div>
        <p className="small-note">{tr(stored.profile.arithmetic)}</p>
        <div className="hero-actions">
          <Link className="primary-button" to="/numbers">
            {tr(
              "\u041F\u043E\u043B\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430 \u0447\u0438\u0441\u0435\u043B \u2197",
            )}
          </Link>
          <Link className="secondary-button" to="/today">
            {tr(
              "\u041C\u043E\u044F \u0442\u0435\u043C\u0430 \u0434\u043D\u044F",
            )}
          </Link>
        </div>
        <p>
          {tr(
            "\u0424\u043E\u043A\u0443\u0441 \u0437\u0430\u043F\u0440\u043E\u0441\u0430:",
          )}
          <b>{tr(quiz?.focus || mini.focus)}</b>
        </p>
      </div>
      <div className="soft-card locked-card">
        <span className="eyebrow">
          {tr(
            "\u041F\u043E\u043B\u043D\u044B\u0439 \u043E\u0442\u0447\u0451\u0442",
          )}
        </span>
        <h2>
          {tr(
            "\u0412\u043D\u0443\u0442\u0440\u0438 \u0435\u0449\u0451 4 \u0437\u0430\u043A\u0440\u044B\u0442\u044B\u0435 \u0441\u0435\u043A\u0446\u0438\u0438",
          )}
        </h2>
        {tr(
          miniReportSections.map((section) => (
            <div key={section.title} className="mini-section">
              <h3>{tr(section.title)}</h3>
              <ul className="feature-list">
                {tr(
                  section.items.map((item) => <li key={item}>{tr(item)}</li>),
                )}
              </ul>
            </div>
          )),
        )}
        <div className="recommended-product">
          <span className="chip sage">
            {tr(
              "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F",
            )}
          </span>
          <h3>{tr(recommended?.title || "Глубокий разбор")}</h3>
          <p>{tr(recommended?.subtitle)}</p>
          <button className="primary-button" onClick={startCheckout}>
            {tr(
              "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u043B\u043D\u044B\u0439 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B",
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
