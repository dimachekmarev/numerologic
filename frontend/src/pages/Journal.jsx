import { useI18n } from "../i18n";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
const moods = ["Тяжело", "Не очень", "Ровно", "Хорошо", "Отлично"];
const blank = {
  text: "",
  mood: 3,
  done: false,
};
export default function Journal() {
  const { t: tr } = useI18n();
  const [params] = useSearchParams(),
    initial = params.get("day");
  const selectedMood = Number(params.get("mood"));
  const initialBlank = {
    ...blank,
    mood:
      Number.isInteger(selectedMood) && selectedMood >= 1 && selectedMood <= 5
        ? selectedMood
        : 3,
  };
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
  const current =
    edit?.key === key
      ? edit.data
      : draft || entry.data || (day === localDay() ? initialBlank : blank);
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
    setEdit({
      key,
      data: {
        ...current,
        ...data,
      },
    });
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
      await api.journal({
        day,
        ...current,
      });
      void api.track("diary_saved", { source: "journal" });
      try {
        sessionStorage.removeItem(key);
      } catch {
        /* Storage is optional. */
      }
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
      } catch {
        /* Storage is optional. */
      }
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
        <span className="eyebrow">
          {tr(
            "\u041B\u0438\u0447\u043D\u043E\u0435, \u0431\u0435\u0437 \u043E\u0446\u0435\u043D\u043E\u043A",
          )}
        </span>
        <h1>
          {tr(
            "\u041A\u0430\u043A \u0432\u044B \u0441\u0435\u0433\u043E\u0434\u043D\u044F?",
          )}
        </h1>
        <p>
          {tr(
            "\u041F\u043E\u043B\u043D\u0430\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F \u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u0439. \u0427\u0435\u0440\u043D\u043E\u0432\u0438\u043A \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F \u0432 \u044D\u0442\u043E\u0439 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \u0434\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F.",
          )}
        </p>
      </div>
      <div className="section-grid journal-layout">
        <form className="soft-card form-grid" onSubmit={save}>
          <h2>
            {tr(
              "\u041F\u0430\u0443\u0437\u0430 \u0434\u043B\u044F \u0441\u0435\u0431\u044F",
            )}
          </h2>
          <label>
            {tr(
              "\u0414\u0435\u043D\u044C \u0437\u0430\u043F\u0438\u0441\u0438",
            )}
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
            <legend>
              {tr(
                "\u041D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435",
              )}
            </legend>
            <div className="mood-row">
              {tr(
                moods.map((m, i) => (
                  <button
                    type="button"
                    key={m}
                    className={current.mood === i + 1 ? "selected" : ""}
                    aria-pressed={current.mood === i + 1}
                    onClick={() =>
                      update({
                        mood: i + 1,
                      })
                    }
                  >
                    {tr(["☁", "◔", "◑", "◕", "☀"][i])}
                    <small>{tr(m)}</small>
                  </button>
                )),
              )}
            </div>
            <label htmlFor="journal-text">
              {tr(
                "\u0427\u0442\u043E \u043F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u043E, \u0447\u0442\u043E \u0432\u044B \u043F\u043E\u0447\u0443\u0432\u0441\u0442\u0432\u043E\u0432\u0430\u043B\u0438 \u0438 \u0447\u0442\u043E \u043F\u043E\u043C\u043E\u0433\u043B\u043E?",
              )}
            </label>
            <textarea
              id="journal-text"
              rows="7"
              maxLength={5000}
              value={current.text}
              onChange={(e) =>
                update({
                  text: e.target.value,
                })
              }
              placeholder={tr("Сегодня я заметила или заметил…")}
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={current.done}
                onChange={(e) =>
                  update({
                    done: e.target.checked,
                  })
                }
              />
              {tr(
                "\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0439 \u0448\u0430\u0433 \u0434\u043D\u044F \u0441\u0434\u0435\u043B\u0430\u043D",
              )}
            </label>
            <button className="primary-button" disabled={!day}>
              {tr(saving ? "Сохраняем…" : "Сохранить запись")}
            </button>
          </fieldset>
          <p role="status">
            {tr(message || (dirty ? "Есть несохранённый черновик" : ""))}
          </p>
          <small>
            {tr(
              "\u041F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u043E\u0431\u043D\u043E\u0432\u0438\u0442 \u0437\u0430\u043F\u0438\u0441\u044C \u0437\u0430 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0434\u0435\u043D\u044C.",
            )}
          </small>
        </form>
        <div>
          <h2>
            {tr(
              "\u0412\u0430\u0448\u0438 \u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u044F",
            )}
          </h2>
          <label className="journal-search">
            {tr(
              "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0432\u0441\u0435\u0439 \u0438\u0441\u0442\u043E\u0440\u0438\u0438",
            )}
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={tr("Слово или дата")}
            />
          </label>
          <Status {...history} />
          <div className="entry-list">
            {tr(
              history.data?.entries.map((e) => (
                <article className="soft-card" key={e.id}>
                  <span className="chip">
                    {tr(e.day)} · {tr(moods[e.mood - 1])}
                  </span>
                  <p className="entry-text">{tr(e.text || "Без текста")}</p>
                  <small>{tr(e.done ? "✓ Шаг сделан" : "В своём темпе")}</small>
                  <div className="hero-actions">
                    <button
                      className="ghost-button"
                      onClick={() => {
                        choose(e.day);
                        document.getElementById("journal-text")?.focus();
                      }}
                      disabled={saving}
                    >
                      {tr(
                        "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
                      )}
                    </button>
                    <button
                      className="ghost-button"
                      onClick={() => remove(e.day)}
                      disabled={saving}
                    >
                      {tr("\u0423\u0434\u0430\u043B\u0438\u0442\u044C")}
                    </button>
                  </div>
                </article>
              )),
            )}
          </div>
          {tr(
            history.data && !history.data.entries.length && (
              <p>
                {tr(
                  search
                    ? "Совпадений нет. Попробуйте другое слово."
                    : "Здесь появится ваша первая запись.",
                )}
              </p>
            ),
          )}
          {tr(
            history.data && (
              <div className="pagination">
                <button
                  className="secondary-button"
                  disabled={page <= 1 || history.loading}
                  onClick={() => setPage((x) => x - 1)}
                >
                  {tr("\u2190 \u041D\u0430\u0437\u0430\u0434")}
                </button>
                <span>
                  {tr(page)} / {tr(history.data.pages)} ·{" "}
                  {tr(history.data.total)}
                  {tr("\u0437\u0430\u043F\u0438\u0441\u0435\u0439")}
                </span>
                <button
                  className="secondary-button"
                  disabled={page >= history.data.pages || history.loading}
                  onClick={() => setPage((x) => x + 1)}
                >
                  {tr("\u0414\u0430\u043B\u0435\u0435 \u2192")}
                </button>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
