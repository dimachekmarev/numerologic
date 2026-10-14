import { useI18n } from "../i18n";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../api";
import TrialAccess from "../components/TrialAccess";
export default function Club() {
  const { t: tr } = useI18n();
  useEffect(() => {
    api.track("club_viewed");
  }, []);
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">Numerologic Club</span>
        <h1>
          {tr(
            "\u041C\u0435\u0441\u0442\u043E, \u0433\u0434\u0435 \u043C\u043E\u0436\u043D\u043E",
          )}
          <br />
          <em>
            {tr(
              "\u0443\u0441\u043B\u044B\u0448\u0430\u0442\u044C \u0441\u0435\u0431\u044F.",
            )}
          </em>
        </h1>
        <p>
          {tr(
            "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0435 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B \u043F\u043B\u044E\u0441 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430, \u043A \u043A\u043E\u0442\u043E\u0440\u043E\u0439 \u043C\u043E\u0436\u043D\u043E \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u0432 \u043D\u0443\u0436\u043D\u044B\u0439 \u043C\u043E\u043C\u0435\u043D\u0442.",
          )}
        </p>
      </div>
      <TrialAccess />
      <div className="section-grid">
        <article className="soft-card club-price feature-card">
          <span className="chip">
            {tr(
              "30 \u0434\u043D\u0435\u0439 \u0434\u043E\u0441\u0442\u0443\u043F\u0430",
            )}
          </span>
          <h2>1 190 ₽</h2>
          <p>
            {tr(
              "\u041F\u0440\u043E\u0434\u043B\u0435\u043D\u0438\u0435 \u0432\u0440\u0443\u0447\u043D\u0443\u044E. \u0412\u044B \u0441\u0430\u043C\u0438 \u0440\u0435\u0448\u0430\u0435\u0442\u0435, \u043A\u043E\u0433\u0434\u0430 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0442\u044C.",
            )}
          </p>
          <Link className="primary-button" to="/checkout?product=club">
            {tr(
              "\u0412\u0441\u0442\u0443\u043F\u0438\u0442\u044C \u0432 \u043A\u043B\u0443\u0431 \u2197",
            )}
          </Link>
          <Link className="ghost-button" to="/practices">
            {tr(
              "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0443",
            )}
          </Link>
        </article>
        <div className="feature-stack">
          {tr(
            [
              [
                "Все практикумы",
                "Границы, ясность, диалог и мягкий фокус. Пошаговые упражнения с отметками прогресса.",
              ],
              [
                "AI-помощник с контекстом",
                "До 10 сообщений в день. Помнит контекст профиля и последних записей при вашем обращении.",
              ],
              [
                "Карта периода и PDF",
                "Личный отчёт с прозрачной арифметикой, темами месяца и планом небольших действий.",
              ],
              [
                "Обзор недели",
                "Дневник, настроение, цели и выполненные практики. Замечайте то, что помогает именно вам.",
              ],
            ].map(([t, p]) => (
              <article key={t}>
                <h3>{tr(t)}</h3>
                <p>{tr(p)}</p>
              </article>
            )),
          )}
        </div>
      </div>
      <p className="small-note">
        {tr(
          "AI \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u043C \u0441\u0435\u0440\u0432\u0438\u0441\u0430. \u0414\u043D\u0435\u0432\u043D\u0438\u043A, \u0446\u0435\u043B\u0438, \u0442\u0435\u043C\u0430 \u0434\u043D\u044F \u0438 \u043F\u0435\u0440\u0432\u044B\u0439 \u0434\u0435\u043D\u044C \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0443\u043C\u043E\u0432 \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u043C\u0438.",
        )}
      </p>
    </section>
  );
}
