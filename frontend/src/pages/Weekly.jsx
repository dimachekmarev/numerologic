import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
export default function Weekly() {
  const state = useLoad(api.weekly),
    d = state.data;
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">Последние семь дней</span>
        <h1>Замечайте свой прогресс.</h1>
        <p>
          Обзор ваших записей и действий. Возвращайтесь к нему в конце недели.
        </p>
      </div>
      <Status {...state} />
      {d && (
        <>
          <span className="chip">
            {d.since} — {d.until}
          </span>
          <div className="numbers-grid section">
            {[
              [d.entries, "Записей за неделю"],
              [d.steps, "Шагов отмечено в дневнике"],
              [d.goals_done, "Целей за неделю выполнено"],
              [d.streak, "Дней записей подряд"],
            ].map(([n, label]) => (
              <article className="soft-card number-tile" key={label}>
                <strong>{n}</strong>
                <p>{label}</p>
              </article>
            ))}
          </div>
          <div className="section-grid">
            <article className="soft-card">
              <h2>Как вы себя чувствовали?</h2>
              <p>
                {d.average_mood === null
                  ? "Пока нет записей настроения."
                  : `Среднее настроение: ${d.average_mood} из 5. Это описание ваших отметок, без оценки или диагноза.`}
              </p>
              <div className="mood-chart">
                {["Тяжело", "Не очень", "Ровно", "Хорошо", "Отлично"].map(
                  (label, i) => (
                    <div key={label}>
                      <span>{label}</span>
                      <div className="mood-track">
                        <i
                          style={{
                            width: `${d.entries ? (d.moods[i] / d.entries) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <b>{d.moods[i]}</b>
                    </div>
                  ),
                )}
              </div>
            </article>
            <article className="soft-card feature-card tint-lavender">
              <span className="chip">Вопрос недели</span>
              <h2>{d.question}</h2>
              <p>
                Что стоит повторить? От чего хочется отказаться? Выберите один
                следующий шаг.
              </p>
              <Link className="primary-button" to="/journal">
                Сохранить наблюдение
              </Link>
              <Link className="ghost-button" to="/goals">
                Выбрать следующий шаг ↗
              </Link>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
