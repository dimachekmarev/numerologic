import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
export default function Assistant() {
  const state = useLoad(api.dashboard),
    config = useLoad(api.config),
    history = useLoad(api.history),
    [messages, setMessages] = useState([]),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [remaining, setRemaining] = useState(null);
  const allMessages = [...(history.data || []), ...messages];
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
      api.track("assistant_used");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section narrow-page">
      <div className="section-heading">
        <span className="eyebrow">AI с контекстом</span>
        <h1>Поговорим о важном?</h1>
        <p>
          Помощник учитывает ваш профиль и семь последних записей дневника.
          Отвечает бережно, помогает сформулировать вопрос и выбрать небольшой
          шаг.
        </p>
      </div>
      <Status {...state} />
      {state.data && !state.data.club ? (
        <article className="soft-card feature-card">
          <h2>Ваш помощник в клубе</h2>
          <p>До 10 сообщений в день. Все практикумы и обзор недели включены.</p>
          <Link className="primary-button" to="/club">
            Открыть клуб
          </Link>
        </article>
      ) : (
        state.data && (
          <>
            <div className="chat-window" aria-live="polite">
              {!allMessages.length && (
                <div className="soft-card">
                  <p>
                    Начните с того, что занимает мысли. Например: «Мне трудно
                    сказать нет — помоги подготовить спокойный ответ».
                  </p>
                </div>
              )}
              {allMessages.map((m, i) => (
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
                disabled={busy || !config.data?.ai_enabled}
              >
                {busy ? "Готовим ответ…" : "Отправить"}
              </button>
              {!config.data?.ai_enabled && (
                <p>Помощник пока не подключён владельцем сервиса.</p>
              )}
              {remaining !== null && (
                <small>Осталось сообщений сегодня: {remaining}</small>
              )}
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
            </form>
          </>
        )
      )}
      <p className="small-note section">
        Это AI-помощник для саморефлексии, не психолог. Он может ошибаться.
        Сообщение и контекст отправляются подключённому поставщику AI только при
        нажатии «Отправить».
      </p>
    </section>
  );
}
