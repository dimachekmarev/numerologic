import { useI18n } from "../i18n";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
export default function Goals() {
  const { t: tr } = useI18n();
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
      await api.goal({
        id: editId,
        title,
        due,
        done: old?.done || false,
      });
      clear();
    });
  }
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">
          {tr(
            "\u0411\u0435\u0437 \u043C\u0430\u0440\u0430\u0444\u043E\u043D\u0430 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439",
          )}
        </span>
        <h1>
          {tr(
            "\u041E\u0434\u0438\u043D \u043F\u043E\u0441\u0438\u043B\u044C\u043D\u044B\u0439 \u0448\u0430\u0433.",
          )}
        </h1>
        <p>
          {tr(
            "\u0421\u0444\u043E\u0440\u043C\u0443\u043B\u0438\u0440\u0443\u0439\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043E\u0442 \u0432\u0430\u0441. \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0441\u0440\u043E\u043A\u0438 \u0438 \u0437\u0430\u043C\u0435\u0447\u0430\u0439\u0442\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u043E\u0435.",
          )}
        </p>
      </div>
      <form className="soft-card goal-form" onSubmit={save}>
        <label>
          {tr("\u041C\u043E\u0439 \u0448\u0430\u0433")}
          <input
            required
            maxLength={200}
            placeholder={tr("Написать черновик, договориться о встрече…")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          {tr("\u041A\u043E\u0433\u0434\u0430")}
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
          {tr(
            busy ? "Сохраняем…" : editId ? "Сохранить изменения" : "Добавить",
          )}
        </button>
        {tr(
          editId && (
            <button className="ghost-button" type="button" onClick={clear}>
              {tr(
                "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435",
              )}
            </button>
          ),
        )}
      </form>
      {tr(error && <p role="alert">{tr(error)}</p>)}
      <div className="filter-row section">
        {tr(
          [
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
              {tr(label)}
            </button>
          )),
        )}
      </div>
      <Status {...state} />
      <div className="entry-list">
        {tr(
          state.data
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
                      perform(() =>
                        api.goal({
                          ...g,
                          done: !g.done,
                        }),
                      )
                    }
                  />
                  <span>
                    {tr(g.title)}
                    <small>
                      {tr(g.due)}
                      {tr(
                        !g.done && g.due < localDay()
                          ? " · срок прошёл — можно перенести"
                          : "",
                      )}
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
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  >
                    {tr("\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C")}
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
            )),
        )}
      </div>
      {tr(
        state.data &&
          !state.data.some(
            (g) => filter === "all" || g.done === (filter === "done"),
          ) && (
            <p>
              {tr(
                filter === "done"
                  ? "Здесь появятся завершённые шаги."
                  : "Пока нет шагов в этой категории.",
              )}
            </p>
          ),
      )}
    </section>
  );
}
