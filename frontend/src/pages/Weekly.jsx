import { useI18n } from "../i18n";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
export default function Weekly() {
  const { t: tr } = useI18n();
  const state = useLoad(api.weekly),
    d = state.data;
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">
          {tr(
            "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0441\u0435\u043C\u044C \u0434\u043D\u0435\u0439",
          )}
        </span>
        <h1>
          {tr(
            "\u0417\u0430\u043C\u0435\u0447\u0430\u0439\u0442\u0435 \u0441\u0432\u043E\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441.",
          )}
        </h1>
        <p>
          {tr(
            "\u041E\u0431\u0437\u043E\u0440 \u0432\u0430\u0448\u0438\u0445 \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439. \u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0439\u0442\u0435\u0441\u044C \u043A \u043D\u0435\u043C\u0443 \u0432 \u043A\u043E\u043D\u0446\u0435 \u043D\u0435\u0434\u0435\u043B\u0438.",
          )}
        </p>
      </div>
      <Status {...state} />
      {tr(
        d && (
          <>
            <span className="chip">
              {tr(d.since)} — {tr(d.until)}
            </span>
            <div className="numbers-grid section">
              {tr(
                [
                  [d.entries, "Записей за неделю"],
                  [d.steps, "Шагов отмечено в дневнике"],
                  [d.goals_done, "Целей за неделю выполнено"],
                  [d.streak, "Дней записей подряд"],
                ].map(([n, label]) => (
                  <article className="soft-card number-tile" key={label}>
                    <strong>{tr(n)}</strong>
                    <p>{tr(label)}</p>
                  </article>
                )),
              )}
            </div>
            <div className="section-grid">
              <article className="soft-card">
                <h2>
                  {tr(
                    "\u041A\u0430\u043A \u0432\u044B \u0441\u0435\u0431\u044F \u0447\u0443\u0432\u0441\u0442\u0432\u043E\u0432\u0430\u043B\u0438?",
                  )}
                </h2>
                <p>
                  {tr(
                    d.average_mood === null
                      ? "Пока нет записей настроения."
                      : `Среднее настроение: ${d.average_mood} из 5. Это описание ваших отметок, без оценки или диагноза.`,
                  )}
                </p>
                <div className="mood-chart">
                  {tr(
                    ["Тяжело", "Не очень", "Ровно", "Хорошо", "Отлично"].map(
                      (label, i) => (
                        <div key={label}>
                          <span>{tr(label)}</span>
                          <div className="mood-track">
                            <i
                              style={{
                                width: `${d.entries ? (d.moods[i] / d.entries) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <b>{tr(d.moods[i])}</b>
                        </div>
                      ),
                    ),
                  )}
                </div>
              </article>
              <article className="soft-card feature-card tint-lavender">
                <span className="chip">
                  {tr(
                    "\u0412\u043E\u043F\u0440\u043E\u0441 \u043D\u0435\u0434\u0435\u043B\u0438",
                  )}
                </span>
                <h2>{tr(d.question)}</h2>
                <p>
                  {tr(
                    "\u0427\u0442\u043E \u0441\u0442\u043E\u0438\u0442 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C? \u041E\u0442 \u0447\u0435\u0433\u043E \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043E\u0442\u043A\u0430\u0437\u0430\u0442\u044C\u0441\u044F? \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0434\u0438\u043D \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433.",
                  )}
                </p>
                <Link className="primary-button" to="/journal">
                  {tr(
                    "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u0435",
                  )}
                </Link>
                <Link className="ghost-button" to="/goals">
                  {tr(
                    "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433 \u2197",
                  )}
                </Link>
              </article>
            </div>
          </>
        ),
      )}
    </section>
  );
}
