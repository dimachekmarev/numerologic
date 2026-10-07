import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
export default function Calendar() {
  const [month, setMonth] = useState(localDay().slice(0, 7)),
    state = useLoad(() => api.calendar(month), [month]);
  return (
    <section className="section">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Ваш ритм</span>
          <h1>Месяц в одном взгляде.</h1>
          <p>
            Символические темы, ваши шаги и записи. Даты не прогнозируют успех
            или неудачу.
          </p>
        </div>
        <label>
          Месяц
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
      </div>
      <Status {...state} />
      <div className="calendar-grid">
        {state.data?.days.map((d) => (
          <article
            className={"calendar-day " + (d.date === localDay() ? "today" : "")}
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
          </article>
        ))}
      </div>
      {state.error && (
        <Link className="primary-button" to="/quiz">
          Заполнить профиль
        </Link>
      )}
    </section>
  );
}
