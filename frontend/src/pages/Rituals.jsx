import { useState } from "react";
import { Link } from "react-router-dom";
import { api, API_BASE } from "../api";
import { useLoad, localDay } from "../hooks";
import { useI18n } from "../i18n";
import Status from "../components/Status";
export default function Rituals() {
  const { language } = useI18n(),
    en = language === "en",
    state = useLoad(api.rituals),
    [title, setTitle] = useState(""),
    [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6]),
    [editing, setEditing] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [month, setMonth] = useState(localDay().slice(0, 7)),
    summary = useLoad(() => api.monthly(month), [month]),
    [time, setTime] = useState("20:00");
  const labels = en
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  async function run(fn) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      state.reload();
      summary.reload();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e) {
    e.preventDefault();
    await run(async () => {
      await api.habit({ id: editing, title, days });
      setTitle("");
      setEditing(null);
    });
  }
  const d = summary.data;
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">
          {en ? "Your own pace" : "Ваш собственный ритм"}
        </span>
        <h1>
          {en
            ? "Small rituals. A place to return."
            : "Маленькие ритуалы. Место для себя."}
        </h1>
        <p>
          {en
            ? "Choose a few actions that matter to you. Rest days are part of the plan."
            : "Выберите несколько действий, которые важны именно вам. Дни отдыха входят в план."}
        </p>
      </div>
      <div className="section-grid">
        <form className="soft-card form-grid" onSubmit={save}>
          <h2>{en ? "My ritual" : "Мой ритуал"}</h2>
          <label>
            {en ? "A small action" : "Небольшое действие"}
            <input
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                en
                  ? "Write one thought, take a quiet break…"
                  : "Записать одну мысль, сделать тихую паузу…"
              }
            />
          </label>
          <fieldset disabled={busy}>
            <legend>{en ? "Days that fit" : "Удобные дни"}</legend>
            <div className="weekday-picker">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={days.includes(day)}
                    onChange={(e) =>
                      setDays((v) =>
                        e.target.checked
                          ? [...v, day]
                          : v.filter((x) => x !== day),
                      )
                    }
                  />
                  {labels[day]}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            className="primary-button"
            disabled={busy || !title.trim() || !days.length || !state.data}
          >
            {busy
              ? en
                ? "Saving…"
                : "Сохраняем…"
              : editing
                ? en
                  ? "Save changes"
                  : "Сохранить изменения"
                : en
                  ? "Add ritual"
                  : "Добавить ритуал"}
          </button>
          {editing && (
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setEditing(null);
                setTitle("");
              }}
            >
              {en ? "Cancel" : "Отменить"}
            </button>
          )}
          <p role="status">{message}</p>
        </form>
        <article className="soft-card feature-card tint-lavender">
          <span className="chip">
            {en ? "30 days for yourself" : "30 дней для себя"}
          </span>
          <h2>
            {en ? "A question for every day." : "Свой вопрос на каждый день."}
          </h2>
          <p>
            {en
              ? "A complete route through self-observation, boundaries and small actions. Pause when needed and continue where you left off."
              : "Полный маршрут наблюдений, границ и небольших действий. Можно сделать паузу и продолжить с того места, где остановились."}
          </p>
          <Link className="primary-button" to="/practices/self-discovery-30">
            {en ? "Try the first day" : "Попробовать первый день"} ↗
          </Link>
          <Link className="ghost-button" to="/weekly">
            {en ? "My weekly review" : "Мой обзор недели"}
          </Link>
        </article>
      </div>
      <div className="section-heading section">
        <h2>{en ? "Today, at your pace" : "Сегодня в вашем темпе"}</h2>
      </div>
      <Status {...state} />
      <div className="dashboard-grid">
        {state.data?.habits.map((h) => (
          <article className="soft-card habit-card" key={h.id}>
            <span className="chip">
              {h.today_planned
                ? en
                  ? "Today’s ritual"
                  : "Ритуал на сегодня"
                : en
                  ? "Rest day"
                  : "День отдыха"}
            </span>
            <h3>{h.title}</h3>
            <div className="habit-week">
              {h.week.map((w) => (
                <span
                  className={w.done ? "done" : w.planned ? "planned" : "rest"}
                  key={w.day}
                  title={w.day}
                >
                  {w.done ? "✓" : w.planned ? "○" : "—"}
                  <small>
                    {labels[new Date(w.day + "T12:00:00Z").getUTCDay()]}
                  </small>
                </span>
              ))}
            </div>
            <p>
              {en
                ? `${h.completed_total} completed. ${h.streak} planned days in a row.`
                : `${h.completed_total} выполнено. ${h.streak} запланированных дней подряд.`}
            </p>
            {h.today_planned && (
              <button
                className={h.today_done ? "secondary-button" : "primary-button"}
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await api.habitMark({
                      id: h.id,
                      day: state.data.day,
                      done: !h.today_done,
                    });
                    if (!h.today_done)
                      void api.track("habit_checked", { source: "rituals" });
                  })
                }
              >
                {h.today_done
                  ? en
                    ? "✓ Done today"
                    : "✓ Сегодня выполнено"
                  : en
                    ? "Mark complete"
                    : "Отметить выполнение"}
              </button>
            )}
            <div className="hero-actions">
              <button
                className="ghost-button"
                disabled={busy}
                onClick={() => {
                  setTitle(h.title);
                  setDays(h.days);
                  setEditing(h.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {en ? "Edit" : "Изменить"}
              </button>
              <button
                className="ghost-button"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      en
                        ? "Delete this ritual and its history?"
                        : "Удалить ритуал и его историю?",
                    )
                  )
                    run(() => api.deleteHabit(h.id));
                }}
              >
                {en ? "Delete" : "Удалить"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {state.data && !state.data.habits.length && (
        <p>
          {en
            ? "Your first ritual will appear here. Start with one small action."
            : "Здесь появится первый ритуал. Начните с одного небольшого действия."}
        </p>
      )}
      <div className="section-heading section split">
        <div>
          <span className="eyebrow">{en ? "Your month" : "Ваш месяц"}</span>
          <h2>
            {en
              ? "Progress you can notice."
              : "Прогресс, который можно заметить."}
          </h2>
        </div>
        <label>
          {en ? "Month" : "Месяц"}
          <input
            type="month"
            value={month}
            onChange={(e) => {
              if (e.target.value) setMonth(e.target.value);
            }}
          />
        </label>
      </div>
      <Status {...summary} />
      {d && (
        <div className="numbers-grid">
          {[
            [d.entries, en ? "Journal entries" : "Записей дневника"],
            [d.habit_marks, en ? "Ritual completions" : "Отметок ритуалов"],
            [d.goals_done, en ? "Completed goals" : "Завершённых целей"],
          ].map(([n, l]) => (
            <article className="soft-card number-tile" key={l}>
              <strong>{n}</strong>
              <p>{l}</p>
            </article>
          ))}
        </div>
      )}
      <article className="soft-card reminder-card section">
        <h3>
          {en ? "Make room in your calendar" : "Выделите время в календаре"}
        </h3>
        <p>
          {en
            ? "Download a daily five-minute reminder and import it into your calendar. This does not subscribe you to emails or notifications."
            : "Скачайте ежедневное напоминание на пять минут и импортируйте в свой календарь. Рассылки и уведомления сервиса не включаются."}
        </p>
        <div className="hero-actions">
          <label>
            {en ? "Time" : "Время"}
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <a
            className="secondary-button"
            href={`${API_BASE}/api/reminder.ics?hour=${Number(time.slice(0, 2))}&minute=${Number(time.slice(3, 5))}`}
          >
            {en ? "Download reminder" : "Скачать напоминание"} ↓
          </a>
        </div>
      </article>
    </section>
  );
}
