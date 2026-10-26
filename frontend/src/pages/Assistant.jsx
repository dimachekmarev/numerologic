import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
import TrialAccess from "../components/TrialAccess";

const exercises = [
  {
    key: "clarity",
    label: "Ясность",
    icon: "🧠",
    title: "Когда в голове шум",
    desc: "Выгрузите мысли и найдите один приоритет за 5 минут.",
    color: "tint-lavender",
  },
  {
    key: "boundaries",
    label: "Границы",
    icon: "🛡",
    title: "Когда сложно отказать",
    desc: "Один короткий отказ без долгих оправданий.",
    color: "tint-sage",
  },
  {
    key: "dialogue",
    label: "Диалог",
    icon: "💬",
    title: "Когда разговор не клеится",
    desc: "Три минуты настоящего слушания.",
    color: "tint-rose",
  },
  {
    key: "focus",
    label: "Фокус",
    icon: "🎯",
    title: "Когда не можешь начать",
    desc: "Один посильный шаг вместо нового плана.",
    color: "tint-lavender",
  },
];

export default function Assistant() {
  const state = useLoad(api.dashboard),
    config = useLoad(api.config),
    history = useLoad(api.history),
    [messages, setMessages] = useState([]),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [remaining, setRemaining] = useState(null),
    [exercise, setExercise] = useState(null),
    [activeExercise, setActiveExercise] = useState(null);

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

  async function guide(focus, label) {
    setActiveExercise(label);
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
    <section className="section assistant-page">
      {/* HERO */}
      <div className="assistant-hero">
        <span className="eyebrow">Помощник</span>
        <h1>
          Что хочется<br />
          <em>прояснить?</em>
        </h1>
        <p>
          Выберите готовое упражнение — бесплатно и без ограничений.
          Или обсудите ситуацию с AI, когда он подключён.
        </p>
      </div>

      <Status {...state} />

      {/* EXERCISE CARDS */}
      <div className="section-heading">
        <span className="eyebrow">Бесплатные упражнения</span>
        <h2>Начните с того, что занимает мысли</h2>
      </div>
      <div className="exercise-grid">
        {exercises.map((ex) => (
          <button
            key={ex.key}
            className={`soft-card exercise-card ${ex.color} ${activeExercise === ex.label ? "active" : ""}`}
            disabled={busy || !state.data}
            onClick={() => guide(ex.key, ex.label)}
          >
            <span className="exercise-icon">{ex.icon}</span>
            <div>
              <h3>{ex.title}</h3>
              <p>{ex.desc}</p>
              <span className="exercise-label">{ex.label} →</span>
            </div>
          </button>
        ))}
      </div>
      <small className="exercise-note">
        Готовые упражнения из библиотеки. Это не ответы AI.
      </small>

      {/* EXERCISE RESULT */}
      {exercise && (
        <article className="soft-card exercise-result">
          <span className="chip sage">Ваше упражнение</span>
          <h2>{exercise.question}</h2>
          <p className="exercise-body">{exercise.exercise}</p>
          <p className="exercise-context">{exercise.context}</p>
          {exercise.next_goal && (
            <div className="exercise-goal">
              <span className="goal-icon">✨</span>
              <p>Ваш незавершённый шаг: <strong>{exercise.next_goal}</strong></p>
            </div>
          )}
          <div className="hero-actions">
            <Link className="primary-button cta-primary" to="/journal">
              Записать ответ →
            </Link>
            {exercise.practice && (
              <Link
                className="secondary-button"
                to={`/practices/${exercise.practice}`}
              >
                Продолжить практику ↗
              </Link>
            )}
          </div>
        </article>
      )}

      {error && <p role="alert" className="error">{error}</p>}

      {/* AI SECTION */}
      <div className="ai-section">
        <div className="section-heading">
          <span className="eyebrow">Разговор с AI</span>
          <h2>
            Персональный помощник<br />
            <em>с контекстом.</em>
          </h2>
          <p>
            Учитывает профиль и семь последних записей дневника. До 10 сообщений в день.
          </p>
        </div>

        <Status {...config} />

        {config.data && !enabled ? (
          <article className="soft-card ai-unavailable-card">
            <span className="ai-status-icon">🤖</span>
            <h3>AI пока не подключён</h3>
            <p>
              Разговор станет доступен после подключения провайдера. 
              Сейчас можно пользоваться упражнениями, картой, дневником и обзором недели.
            </p>
            <Link className="secondary-button" to="/practices">
              Попробовать практики ↗
            </Link>
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
                    <span>{m.role === "user" ? "👤 Вы" : "🤖 Помощник"}</span>
                    <p>{m.text}</p>
                  </div>
                ))}
                {busy && (
                  <div className="chat-message assistant typing">
                    <span>🤖 Помощник</span>
                    <p>Помощник отвечает…</p>
                  </div>
                )}
              </div>
              <form className="form-grid ai-form" onSubmit={send}>
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
                <div className="ai-form-actions">
                  <button
                    className="primary-button cta-primary"
                    disabled={busy || !text.trim()}
                  >
                    {busy ? "⏳ Готовим ответ…" : "Отправить →"}
                  </button>
                  {remaining !== null && (
                    <small className="ai-remaining">
                      Осталось сообщений сегодня: <strong>{remaining}</strong>
                    </small>
                  )}
                </div>
              </form>
            </>
          )
        )}
      </div>

      <p className="small-note section">
        AI может ошибаться. Вопрос и контекст отправляются поставщику только при нажатии «Отправить».
      </p>
    </section>
  );
}
