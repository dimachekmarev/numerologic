import { useState } from "react";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
export default function Goals() {
  const state = useLoad(api.goals),
    [title, setTitle] = useState(""),
    [due, setDue] = useState(localDay()),
    [error, setError] = useState("");
  async function save(e) {
    e.preventDefault();
    try {
      await api.goal({ title, due, done: false });
      setTitle("");
      state.reload();
    } catch (e) {
      setError(e.message);
    }
  }
  async function toggle(g) {
    try {
      await api.goal({ ...g, done: !g.done });
      state.reload();
    } catch (e) {
      setError(e.message);
    }
  }
  async function remove(id) {
    try {
      await api.deleteGoal(id);
      state.reload();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">Без марафона достижений</span>
        <h1>Один посильный шаг.</h1>
        <p>
          Формулируйте действие, которое зависит от вас и занимает до пятнадцати
          минут.
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
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </label>
        <button className="primary-button">Добавить</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <Status {...state} />
      <div className="entry-list">
        {state.data?.map((g) => (
          <article
            className={"soft-card goal-row " + (g.done ? "done" : "")}
            key={g.id}
          >
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={g.done}
                onChange={() => toggle(g)}
              />
              <span>
                {g.title}
                <small>{g.due}</small>
              </span>
            </label>
            <button
              className="ghost-button"
              onClick={() => remove(g.id)}
              aria-label={"Удалить цель " + g.title}
            >
              ×
            </button>
          </article>
        ))}
        {state.data && !state.data.length && <p>Здесь появятся ваши шаги.</p>}
      </div>
    </section>
  );
}
