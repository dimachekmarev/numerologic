import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
export default function Goals() {
  const [params] = useSearchParams();
  const chosen = params.get("due");
  const initialDue = /^\d{4}-\d{2}-\d{2}$/.test(chosen || "")
    ? chosen
    : localDay();
  const state = useLoad(api.goals),
    [title, setTitle] = useState(""),
    [due, setDue] = useState(initialDue),
    [editId, setEditId] = useState(null),
    [filter, setFilter] = useState("active"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  function clear() {
    setTitle("");
    setDue(localDay());
    setEditId(null);
  }
  async function perform(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
      state.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e) {
    e.preventDefault();
    await perform(async () => {
      const old = state.data?.find((g) => g.id === editId);
      await api.goal({ id: editId, title, due, done: old?.done || false });
      clear();
    });
  }
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">Без марафона достижений</span>
        <h1>Один посильный шаг.</h1>
        <p>
          Сформулируйте действие, которое зависит от вас. Редактируйте сроки и
          замечайте завершённое.
        </p>
      </div>
      <form className="soft-card goal-form" onSubmit={save}>
        <label>
          Мой шаг
          <input
            required
            maxLength={200}
            placeholder="Написать черновик, договориться о встрече…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Когда
          <input
            required
            type="date"
            min="1900-01-01"
            max="2100-12-31"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </label>
        <button className="primary-button" disabled={busy || !state.data}>
          {busy ? "Сохраняем…" : editId ? "Сохранить изменения" : "Добавить"}
        </button>
        {editId && (
          <button className="ghost-button" type="button" onClick={clear}>
            Отменить редактирование
          </button>
        )}
      </form>
      {error && <p role="alert">{error}</p>}
      <div className="filter-row section">
        {[
          ["active", "В работе"],
          ["done", "Завершённые"],
          ["all", "Все"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={filter === key ? "active" : ""}
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <Status {...state} />
      <div className="entry-list">
        {state.data
          ?.filter((g) => filter === "all" || g.done === (filter === "done"))
          .map((g) => (
            <article
              className={"soft-card goal-row " + (g.done ? "done" : "")}
              key={g.id}
            >
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={g.done}
                  disabled={busy}
                  onChange={() =>
                    perform(() => api.goal({ ...g, done: !g.done }))
                  }
                />
                <span>
                  {g.title}
                  <small>
                    {g.due}
                    {!g.done && g.due < localDay()
                      ? " · срок прошёл — можно перенести"
                      : ""}
                  </small>
                </span>
              </label>
              <div className="hero-actions">
                <button
                  className="ghost-button"
                  disabled={busy}
                  onClick={() => {
                    setEditId(g.id);
                    setTitle(g.title);
                    setDue(g.due);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Изменить
                </button>
                <button
                  className="ghost-button"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm("Удалить этот шаг?"))
                      perform(async () => {
                        await api.deleteGoal(g.id);
                        if (editId === g.id) clear();
                      });
                  }}
                  aria-label={"Удалить цель " + g.title}
                >
                  ×
                </button>
              </div>
            </article>
          ))}
      </div>
      {state.data &&
        !state.data.some(
          (g) => filter === "all" || g.done === (filter === "done"),
        ) && (
          <p>
            {filter === "done"
              ? "Здесь появятся завершённые шаги."
              : "Пока нет шагов в этой категории."}
          </p>
        )}
    </section>
  );
}
