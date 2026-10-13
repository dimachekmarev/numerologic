import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
export default function Calendar() {
  const [month, setMonth] = useState(localDay().slice(0, 7)),
    state = useLoad(() => api.calendar(month), [month]);
  const offset = month
    ? (new Date(month + "-01T12:00:00Z").getUTCDay() + 6) % 7
    : 0;
  function shift(n) {
    const date = new Date(month + "-01T12:00:00Z");
    date.setUTCMonth(date.getUTCMonth() + n);
    setMonth(date.toISOString().slice(0, 7));
  }
  return (
    <section className="section">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Ваш ритм</span>
          <h1>Месяц в одном взгляде.</h1>
          <p>
            Символические темы, ваши шаги и записи. Нажмите на день, чтобы
            открыть дневник.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="secondary-button"
            aria-label="Предыдущий месяц"
            disabled={month === "1900-01"}
            onClick={() => shift(-1)}
          >
            ←
          </button>
          <label>
            Месяц
            <input
              type="month"
              min="1900-01"
              max="2100-12"
              value={month}
              onChange={(e) => {
                if (e.target.value) setMonth(e.target.value);
              }}
            />
          </label>
          <button
            className="secondary-button"
            aria-label="Следующий месяц"
            disabled={month === "2100-12"}
            onClick={() => shift(1)}
          >
            →
          </button>
        </div>
      </div>
      <Status {...state} />
      {state.data && (
        <div className="calendar-scroll">
          <div className="calendar-weekdays">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: offset }, (_, i) => (
              <div
                key={"blank" + i}
                className="calendar-empty"
                aria-hidden="true"
              />
            ))}
            {state.data.days.map((d) => (
              <article
                className={
                  "calendar-day " + (d.date === localDay() ? "today" : "")
                }
                key={d.date}
              >
                <strong>{Number(d.date.slice(-2))}</strong>
                <span>{d.theme}</span>
                {d.journal && <small>● Запись в дневнике</small>}
                {d.goals.map((g) => (
                  <small key={g.id}>
                    {g.done ? "✓" : "○"} {g.title}
                  </small>
                ))}
                <Link
                  className="calendar-action"
                  to={
                    d.date <= localDay()
                      ? `/journal?day=${d.date}`
                      : `/goals?due=${d.date}`
                  }
                >
                  {d.date <= localDay() ? "Дневник ↗" : "Добавить шаг ↗"}
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}
      {state.error && (
        <Link className="primary-button" to="/quiz">
          Заполнить профиль
        </Link>
      )}
    </section>
  );
}
