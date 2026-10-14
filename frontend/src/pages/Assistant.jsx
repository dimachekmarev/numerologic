import { useI18n } from "../i18n";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
import TrialAccess from "../components/TrialAccess";
export default function Assistant() {
  const { t: tr } = useI18n();
  const state = useLoad(api.dashboard),
    config = useLoad(api.config),
    history = useLoad(api.history),
    [messages, setMessages] = useState([]),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [remaining, setRemaining] = useState(null),
    [exercise, setExercise] = useState(null);
  const enabled = config.data?.ai_enabled,
    allowed = state.data?.club || state.data?.trial.active;
  async function send(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    const question = text;
    try {
      const result = await api.assistant(question);
      setMessages((m) => [
        ...m,
        {
          role: "user",
          text: question,
        },
        {
          role: "assistant",
          text: result.reply,
        },
      ]);
      setRemaining(result.remaining);
      setText("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function guide(focus) {
    setBusy(true);
    setError("");
    try {
      setExercise(await api.reflection(focus));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section narrow-page">
      <div className="section-heading">
        <span className="eyebrow">
          {tr(
            "\u041E\u0434\u0438\u043D \u0432\u043E\u043F\u0440\u043E\u0441. \u041E\u0434\u0438\u043D \u043D\u0435\u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0448\u0430\u0433.",
          )}
        </span>
        <h1>
          {tr(
            "\u0427\u0442\u043E \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043F\u0440\u043E\u044F\u0441\u043D\u0438\u0442\u044C?",
          )}
        </h1>
        <p>
          {tr(
            "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0433\u043E\u0442\u043E\u0432\u043E\u0435 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u043E\u0431\u0441\u0443\u0434\u0438\u0442\u0435 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u044E \u0441 AI, \u043A\u043E\u0433\u0434\u0430 \u043E\u043D \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D.",
          )}
        </p>
      </div>
      <Status {...state} />
      <article className="soft-card feature-card">
        <span className="chip">
          {tr(
            "\u0423\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E",
          )}
        </span>
        <h2>
          {tr(
            "\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0441 \u0442\u043E\u0433\u043E, \u0447\u0442\u043E \u0437\u0430\u043D\u0438\u043C\u0430\u0435\u0442 \u043C\u044B\u0441\u043B\u0438.",
          )}
        </h2>
        <div className="filter-row">
          {tr(
            [
              ["clarity", "Ясность"],
              ["boundaries", "Границы"],
              ["dialogue", "Диалог"],
              ["focus", "Фокус"],
            ].map(([key, label]) => (
              <button
                key={key}
                disabled={busy || !state.data}
                onClick={() => guide(key)}
              >
                {tr(label)}
              </button>
            )),
          )}
        </div>
        <small>
          {tr(
            "\u0413\u043E\u0442\u043E\u0432\u044B\u0435 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u044F \u0438\u0437 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438. \u042D\u0442\u043E \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u044B AI.",
          )}
        </small>
        {tr(
          exercise && (
            <div className="reflection-result">
              <h3>{tr(exercise.question)}</h3>
              <p>{tr(exercise.exercise)}</p>
              <p>{tr(exercise.context)}</p>
              {tr(
                exercise.next_goal && (
                  <p>
                    {tr(
                      "\u0412\u0430\u0448 \u043D\u0435\u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u044B\u0439 \u0448\u0430\u0433:",
                    )}
                    {tr(exercise.next_goal)}
                  </p>
                ),
              )}
              <div className="hero-actions">
                <Link className="primary-button" to="/journal">
                  {tr(
                    "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u043E\u0442\u0432\u0435\u0442",
                  )}
                </Link>
                <Link
                  className="secondary-button"
                  to={`/practices/${exercise.practice}`}
                >
                  {tr(
                    "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0443 \u2197",
                  )}
                </Link>
              </div>
            </div>
          ),
        )}
      </article>
      <div className="section-heading section">
        <h2>
          {tr("\u0420\u0430\u0437\u0433\u043E\u0432\u043E\u0440 \u0441 AI")}
        </h2>
        <p>
          {tr(
            "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0438 \u0441\u0435\u043C\u044C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u0430. \u0414\u043E \u0434\u0435\u0441\u044F\u0442\u0438 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u0432 \u0434\u0435\u043D\u044C.",
          )}
        </p>
      </div>
      <Status {...config} />
      {tr(
        config.data && !enabled ? (
          <article className="soft-card feature-card">
            <h3>
              {tr(
                "AI \u043F\u043E\u043A\u0430 \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D.",
              )}
            </h3>
            <p>
              {tr(
                "\u0420\u0430\u0437\u0433\u043E\u0432\u043E\u0440 \u0441\u0442\u0430\u043D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0430. \u0421\u0435\u0439\u0447\u0430\u0441 \u043C\u043E\u0436\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u044F\u043C\u0438, \u043A\u0430\u0440\u0442\u043E\u0439, \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u043E\u043C \u0438 \u043E\u0431\u0437\u043E\u0440\u043E\u043C \u043D\u0435\u0434\u0435\u043B\u0438.",
              )}
            </p>
          </article>
        ) : state.data && !allowed ? (
          <TrialAccess onChanged={state.reload} />
        ) : (
          enabled &&
          state.data && (
            <>
              <div className="chat-window" aria-live="polite">
                {tr(
                  [...(history.data || []), ...messages].map((m, i) => (
                    <div className={"chat-message " + m.role} key={i}>
                      <span>{tr(m.role === "user" ? "Вы" : "Помощник")}</span>
                      <p>{m.text}</p>
                    </div>
                  )),
                )}
                {tr(
                  busy && (
                    <p role="status">
                      {tr(
                        "\u041F\u043E\u043C\u043E\u0449\u043D\u0438\u043A \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442\u2026",
                      )}
                    </p>
                  ),
                )}
              </div>
              <form className="form-grid" onSubmit={send}>
                <label htmlFor="ai-message">
                  {tr(
                    "\u0412\u0430\u0448 \u0432\u043E\u043F\u0440\u043E\u0441",
                  )}
                </label>
                <textarea
                  id="ai-message"
                  required
                  maxLength={2000}
                  rows="3"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={tr("Что сейчас хочется прояснить?")}
                />
                <button
                  className="primary-button"
                  disabled={busy || !text.trim()}
                >
                  {tr(busy ? "Готовим ответ…" : "Отправить")}
                </button>
                {tr(
                  remaining !== null && (
                    <small>
                      {tr(
                        "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u0441\u0435\u0433\u043E\u0434\u043D\u044F:",
                      )}
                      {tr(remaining)}
                    </small>
                  ),
                )}
              </form>
            </>
          )
        ),
      )}
      {tr(error && <p role="alert">{tr(error)}</p>)}
      <p className="small-note section">
        {tr(
          "AI \u043C\u043E\u0436\u0435\u0442 \u043E\u0448\u0438\u0431\u0430\u0442\u044C\u0441\u044F. \u0412\u043E\u043F\u0440\u043E\u0441 \u0438 \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0443 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0438 \u043D\u0430\u0436\u0430\u0442\u0438\u0438 \xAB\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C\xBB.",
        )}
      </p>
    </section>
  );
}
