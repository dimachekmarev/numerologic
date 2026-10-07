import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, API_BASE } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
export default function Report() {
  const { id } = useParams(),
    state = useLoad(() => api.report(id), [id]),
    [reflection, setReflection] = useState(""),
    [busy, setBusy] = useState(false);
  async function discuss() {
    setBusy(true);
    try {
      const r = await api.discuss(id);
      setReflection(r.reply);
    } catch (e) {
      setReflection(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!state.data)
    return (
      <section className="section">
        <Status {...state} />
      </section>
    );
  const r = state.data;
  return (
    <section className="section narrow-page">
      <div className="section-heading">
        <Link to="/dashboard">← Кабинет</Link>
        <span className="chip">Ваш материал</span>
        <h1>{r.title}</h1>
        <div className="hero-actions">
          <a
            className="primary-button"
            href={`${API_BASE}/api/reports/${id}/pdf`}
          >
            Скачать PDF ↓
          </a>
          <Link className="secondary-button" to="/journal">
            Открыть дневник
          </Link>
        </div>
      </div>
      <article className="soft-card report-document">
        {r.content.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </article>
      <article className="soft-card feature-card" style={{ marginTop: 24 }}>
        <h2>Применить к своей ситуации.</h2>
        <p>
          AI из клуба поможет связать материал с вашим дневником. Одно сообщение
          из дневного лимита.
        </p>
        <button className="secondary-button" onClick={discuss} disabled={busy}>
          {busy ? "Готовим ответ…" : "Обсудить с AI"}
        </button>
        {reflection && (
          <p className="entry-text" role="status">
            {reflection}
          </p>
        )}
      </article>
    </section>
  );
}
