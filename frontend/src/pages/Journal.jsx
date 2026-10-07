import { useState } from "react";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
const moods = ["Тяжело", "Не очень", "Ровно", "Хорошо", "Отлично"];
export default function Journal() {
  const state = useLoad(api.dashboard);
  const [day, setDay] = useState(localDay());
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState(null),
    [text, setText] = useState(null),
    [done, setDone] = useState(null),
    [message, setMessage] = useState(""),
    [saving, setSaving] = useState(false);
  const saved = state.data?.entries.find((entry) => entry.day === day);
  const currentText = text ?? saved?.text ?? "";
  const currentMood = mood ?? saved?.mood ?? 3;
  const currentDone = done ?? saved?.done ?? false;
  function chooseDay(value) {
    setDay(value); setText(null); setMood(null); setDone(null); setMessage("");
  }
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.journal({ day, mood: currentMood, text: currentText, done: currentDone });
      setMessage("Запись сохранена");
      state.reload();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">Личное, без оценок</span>
        <h1>Как вы сегодня?</h1>
        <p>
          Всё, что вы запишете, остаётся в вашем кабинете. Помощник использует
          последние записи только при вашем обращении к нему.
        </p>
      </div>
      <div className="section-grid journal-layout">
        <form className="soft-card form-grid" onSubmit={save}>
          <h2>Пауза для себя</h2>
          <label>
            День записи
            <input type="date" required min="1900-01-01" max={localDay()}
              value={day} onChange={(e) => chooseDay(e.target.value)} />
          </label>
          <label>Настроение</label>
          <div className="mood-row">
            {moods.map((m, i) => (
              <button
                type="button"
                key={m}
                className={currentMood === i + 1 ? "selected" : ""}
                onClick={() => { setMood(i + 1); }}
                aria-pressed={currentMood === i + 1}
              >
                {["☁", "◔", "◑", "◕", "☀"][i]}
                <small>{m}</small>
              </button>
            ))}
          </div>
          <label htmlFor="journal-text">
            Что произошло, что вы почувствовали и что помогло?
          </label>
          <textarea
            id="journal-text"
            rows="7"
            maxLength={5000}
            value={currentText}
            onChange={(e) => { setText(e.target.value); }}
            placeholder="Сегодня я заметила или заметил…"
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={currentDone}
              onChange={(e) => { setDone(e.target.checked); }}
            />
            Маленький шаг дня сделан
          </label>
          <button className="primary-button" disabled={saving || !state.data}>
            {saving ? "Сохраняем…" : "Сохранить запись"}
          </button>
          <p role="status">{message}</p>
          <small>Повторное сохранение обновит запись за выбранный день.</small>
        </form>
        <div>
          <Status {...state} />
          <h2>Ваши наблюдения</h2>
          {state.data?.entries.length > 0 && <label className="journal-search">
            Найти запись
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Слово или дата" />
          </label>}
          <div className="entry-list">
            {state.data?.entries.filter((e) => `${e.day} ${e.text}`.toLowerCase().includes(search.toLowerCase())).map((e) => (
              <article className="soft-card" key={e.id}>
                <span className="chip">
                  {e.day} · {moods[e.mood - 1]}
                </span>
                <p className="entry-text">{e.text || "Без текста"}</p>
                <small>{e.done ? "✓ Шаг сделан" : "В своём темпе"}</small>
                {(
                  <button
                    className="ghost-button"
                    onClick={() => {
                      setText(e.text);
                      setMood(e.mood);
                      setDone(e.done);
                      setDay(e.day);
                      setMessage("");
                      document.getElementById("journal-text")?.focus();
                    }}
                  >
                    Редактировать
                  </button>
                )}
              </article>
            ))}
            {state.data && !state.data.entries.length && (
              <p>Первая запись станет началом вашей истории.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
