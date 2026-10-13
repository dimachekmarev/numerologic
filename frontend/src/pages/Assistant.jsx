import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
import TrialAccess from "../components/TrialAccess";
export default function Assistant() {
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
        { role: "user", text: question },
        { role: "assistant", text: result.reply },
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
        <span className="eyebrow">Один вопрос. Один небольшой шаг.</span>
        <h1>Что хочется прояснить?</h1>
        <p>
          Выберите готовое упражнение или обсудите ситуацию с AI, когда он
          подключён.
        </p>
      </div>
      <Status {...state} />
      <article className="soft-card feature-card">
        <span className="chip">Упражнения доступны бесплатно</span>
        <h2>Начните с того, что занимает мысли.</h2>
        <div className="filter-row">
          {[
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
              {label}
            </button>
          ))}
        </div>
        <small>Готовые упражнения из библиотеки. Это не ответы AI.</small>
        {exercise && (
          <div className="reflection-result">
            <h3>{exercise.question}</h3>
            <p>{exercise.exercise}</p>
            <p>{exercise.context}</p>
            {exercise.next_goal && (
              <p>Ваш незавершённый шаг: {exercise.next_goal}</p>
            )}
            <div className="hero-actions">
              <Link className="primary-button" to="/journal">
                Записать ответ
              </Link>
              <Link
                className="secondary-button"
                to={`/practices/${exercise.practice}`}
              >
                Продолжить практику ↗
              </Link>
            </div>
          </div>
        )}
      </article>
      <div className="section-heading section">
        <h2>Разговор с AI</h2>
        <p>
          Учитывает профиль и семь последних записей дневника. До десяти
          сообщений в день.
        </p>
      </div>
      <Status {...config} />
      {config.data && !enabled ? (
        <article className="soft-card feature-card">
          <h3>AI пока не подключён.</h3>
          <p>
            Разговор станет доступен после подключения провайдера. Сейчас можно
            пользоваться упражнениями, картой, дневником и обзором недели.
          </p>
        </article>
      ) : state.data && !allowed ? (
        <TrialAccess onChanged={state.reload} />
      ) : (
        enabled &&
        state.data && (
          <>
            <div className="chat-window" aria-live="polite">
              {[...(history.data || []), ...messages].map((m, i) => (
                <div className={"chat-message " + m.role} key={i}>
                  <span>{m.role === "user" ? "Вы" : "Помощник"}</span>
                  <p>{m.text}</p>
                </div>
              ))}
              {busy && <p role="status">Помощник отвечает…</p>}
            </div>
            <form className="form-grid" onSubmit={send}>
              <label htmlFor="ai-message">Ваш вопрос</label>
              <textarea
                id="ai-message"
                required
                maxLength={2000}
                rows="3"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Что сейчас хочется прояснить?"
              />
              <button
                className="primary-button"
                disabled={busy || !text.trim()}
              >
                {busy ? "Готовим ответ…" : "Отправить"}
              </button>
              {remaining !== null && (
                <small>Осталось сообщений сегодня: {remaining}</small>
              )}
            </form>
          </>
        )
      )}
      {error && <p role="alert">{error}</p>}
      <p className="small-note section">
        AI может ошибаться. Вопрос и контекст отправляются поставщику только при
        нажатии «Отправить».
      </p>
    </section>
  );
}
