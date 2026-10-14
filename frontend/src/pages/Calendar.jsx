import { useI18n } from "../i18n";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
export default function Calendar() {
  const { t: tr } = useI18n();
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
          <span className="eyebrow">
            {tr("\u0412\u0430\u0448 \u0440\u0438\u0442\u043C")}
          </span>
          <h1>
            {tr(
              "\u041C\u0435\u0441\u044F\u0446 \u0432 \u043E\u0434\u043D\u043E\u043C \u0432\u0437\u0433\u043B\u044F\u0434\u0435.",
            )}
          </h1>
          <p>
            {tr(
              "\u0421\u0438\u043C\u0432\u043E\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0442\u0435\u043C\u044B, \u0432\u0430\u0448\u0438 \u0448\u0430\u0433\u0438 \u0438 \u0437\u0430\u043F\u0438\u0441\u0438. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u0434\u0435\u043D\u044C, \u0447\u0442\u043E\u0431\u044B \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0434\u043D\u0435\u0432\u043D\u0438\u043A.",
            )}
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="secondary-button"
            aria-label={tr("Предыдущий месяц")}
            disabled={month === "1900-01"}
            onClick={() => shift(-1)}
          >
            ←
          </button>
          <label>
            {tr("\u041C\u0435\u0441\u044F\u0446")}
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
            aria-label={tr("Следующий месяц")}
            disabled={month === "2100-12"}
            onClick={() => shift(1)}
          >
            →
          </button>
        </div>
      </div>
      <Status {...state} />
      {tr(
        state.data && (
          <div className="calendar-scroll">
            <div className="calendar-weekdays">
              {tr(
                ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
                  <span key={d}>{tr(d)}</span>
                )),
              )}
            </div>
            <div className="calendar-grid">
              {tr(
                Array.from(
                  {
                    length: offset,
                  },
                  (_, i) => (
                    <div
                      key={"blank" + i}
                      className="calendar-empty"
                      aria-hidden="true"
                    />
                  ),
                ),
              )}
              {tr(
                state.data.days.map((d) => (
                  <article
                    className={
                      "calendar-day " + (d.date === localDay() ? "today" : "")
                    }
                    key={d.date}
                  >
                    <strong>{tr(Number(d.date.slice(-2)))}</strong>
                    <span>{tr(d.theme)}</span>
                    {tr(
                      d.journal && (
                        <small>
                          {tr(
                            "\u25CF \u0417\u0430\u043F\u0438\u0441\u044C \u0432 \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u0435",
                          )}
                        </small>
                      ),
                    )}
                    {tr(
                      d.goals.map((g) => (
                        <small key={g.id}>
                          {tr(g.done ? "✓" : "○")} {tr(g.title)}
                        </small>
                      )),
                    )}
                    <Link
                      className="calendar-action"
                      to={
                        d.date <= localDay()
                          ? `/journal?day=${d.date}`
                          : `/goals?due=${d.date}`
                      }
                    >
                      {tr(
                        d.date <= localDay() ? "Дневник ↗" : "Добавить шаг ↗",
                      )}
                    </Link>
                  </article>
                )),
              )}
            </div>
          </div>
        ),
      )}
      {tr(
        state.error && (
          <Link className="primary-button" to="/quiz">
            {tr(
              "\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u043F\u0440\u043E\u0444\u0438\u043B\u044C",
            )}
          </Link>
        ),
      )}
    </section>
  );
}
