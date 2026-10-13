import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
const moods = ["Тяжело", "Не очень", "Ровно", "Хорошо", "Отлично"];
const blank = { text: "", mood: 3, done: false };
export default function Journal() {
  const [params] = useSearchParams(),
    initial = params.get("day");
  const me = useLoad(api.me),
    [day, setDay] = useState(
      /^\d{4}-\d{2}-\d{2}$/.test(initial || "") && initial <= localDay()
        ? initial
        : localDay(),
    ),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [edit, setEdit] = useState(null),
    [message, setMessage] = useState(""),
    [saving, setSaving] = useState(false);
  const history = useLoad(() => api.journals(page, search), [page, search]),
    entry = useLoad(() => api.journalDay(day), [day]);
  const key = me.data ? `numerologic_draft:${me.data.id}:${day}` : "";
  let draft = null;
  try {
    draft = key ? JSON.parse(sessionStorage.getItem(key)) : null;
  } catch {
    /*Storage is optional.*/
  }
  const current = edit?.key === key ? edit.data : draft || entry.data || blank;
  const dirty =
    JSON.stringify({
      text: current.text,
      mood: current.mood,
      done: current.done,
    }) !==
    JSON.stringify({
      text: entry.data?.text || "",
      mood: entry.data?.mood || 3,
      done: entry.data?.done || false,
    });
  useEffect(() => {
    if (edit?.key && edit.key === key) {
      try {
        sessionStorage.setItem(key, JSON.stringify(edit.data));
      } catch {
        /*Storage is optional.*/
      }
    }
  }, [edit, key]);
  function update(data) {
    setEdit({ key, data: { ...current, ...data } });
    setMessage("");
  }
  function choose(value) {
    if (value === day) return;
    if (
      dirty &&
      !window.confirm(
        "Черновик останется в этой вкладке. Перейти к другому дню?",
      )
    )
      return;
    setDay(value);
    setEdit(null);
    setMessage("");
  }
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await api.journal({ day, ...current });
      try {
        sessionStorage.removeItem(key);
      } catch {}
      setEdit(null);
      setMessage("Запись сохранена");
      entry.reload();
      history.reload();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function remove(date) {
    if (!window.confirm("Удалить запись за " + date + "?")) return;
    setSaving(true);
    try {
      await api.deleteJournal(date);
      try {
        sessionStorage.removeItem(`numerologic_draft:${me.data.id}:${date}`);
      } catch {}
      if (date === day) {
        setEdit(null);
        entry.reload();
      }
      history.reload();
      setMessage("Запись удалена");
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
          Полная история наблюдений. Черновик остаётся в этой вкладке до
          сохранения.
        </p>
      </div>
      <div className="section-grid journal-layout">
        <form className="soft-card form-grid" onSubmit={save}>
          <h2>Пауза для себя</h2>
          <label>
            День записи
            <input
              type="date"
              required
              min="1900-01-01"
              max={localDay()}
              value={day}
              disabled={saving}
              onChange={(e) => choose(e.target.value)}
            />
          </label>
          <Status {...entry} />
          <fieldset
            disabled={saving || entry.loading || !!entry.error || !me.data}
          >
            <legend>Настроение</legend>
            <div className="mood-row">
              {moods.map((m, i) => (
                <button
                  type="button"
                  key={m}
                  className={current.mood === i + 1 ? "selected" : ""}
                  aria-pressed={current.mood === i + 1}
                  onClick={() => update({ mood: i + 1 })}
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
              value={current.text}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Сегодня я заметила или заметил…"
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={current.done}
                onChange={(e) => update({ done: e.target.checked })}
              />
              Маленький шаг дня сделан
            </label>
            <button className="primary-button" disabled={!day}>
              {saving ? "Сохраняем…" : "Сохранить запись"}
            </button>
          </fieldset>
          <p role="status">
            {message || (dirty ? "Есть несохранённый черновик" : "")}
          </p>
          <small>Повторное сохранение обновит запись за выбранный день.</small>
        </form>
        <div>
          <h2>Ваши наблюдения</h2>
          <label className="journal-search">
            Поиск по всей истории
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Слово или дата"
            />
          </label>
          <Status {...history} />
          <div className="entry-list">
            {history.data?.entries.map((e) => (
              <article className="soft-card" key={e.id}>
                <span className="chip">
                  {e.day} · {moods[e.mood - 1]}
                </span>
                <p className="entry-text">{e.text || "Без текста"}</p>
                <small>{e.done ? "✓ Шаг сделан" : "В своём темпе"}</small>
                <div className="hero-actions">
                  <button
                    className="ghost-button"
                    onClick={() => {
                      choose(e.day);
                      document.getElementById("journal-text")?.focus();
                    }}
                    disabled={saving}
                  >
                    Редактировать
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => remove(e.day)}
                    disabled={saving}
                  >
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>
          {history.data && !history.data.entries.length && (
            <p>
              {search
                ? "Совпадений нет. Попробуйте другое слово."
                : "Здесь появится ваша первая запись."}
            </p>
          )}
          {history.data && (
            <div className="pagination">
              <button
                className="secondary-button"
                disabled={page <= 1 || history.loading}
                onClick={() => setPage((x) => x - 1)}
              >
                ← Назад
              </button>
              <span>
                {page} / {history.data.pages} · {history.data.total} записей
              </span>
              <button
                className="secondary-button"
                disabled={page >= history.data.pages || history.loading}
                onClick={() => setPage((x) => x + 1)}
              >
                Далее →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
