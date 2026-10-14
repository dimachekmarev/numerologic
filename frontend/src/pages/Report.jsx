import { useI18n } from "../i18n";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, API_BASE } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
export default function Report() {
  const { t: tr, language } = useI18n();
  const { id } = useParams(),
    state = useLoad(() => api.report(id), [id]),
    config = useLoad(api.config),
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
        <Link to="/dashboard">
          {tr("\u2190 \u041A\u0430\u0431\u0438\u043D\u0435\u0442")}
        </Link>
        <span className="chip">
          {tr(
            "\u0412\u0430\u0448 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B",
          )}
        </span>
        <h1>{tr(r.title)}</h1>
        <div className="hero-actions">
          <a
            className="primary-button"
            href={`${API_BASE}/api/reports/${id}/pdf?lang=${language}`}
          >
            {tr("\u0421\u043A\u0430\u0447\u0430\u0442\u044C PDF \u2193")}
          </a>
          <Link className="secondary-button" to="/journal">
            {tr(
              "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0434\u043D\u0435\u0432\u043D\u0438\u043A",
            )}
          </Link>
        </div>
      </div>
      <article className="soft-card report-document">
        {tr(
          r.content
            .split("\n\n")
            .map((paragraph, i) => <p key={i}>{tr(paragraph)}</p>),
        )}
      </article>
      <article
        className="soft-card feature-card"
        style={{
          marginTop: 24,
        }}
      >
        <h2>
          {tr(
            "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u043A \u0441\u0432\u043E\u0435\u0439 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u0438.",
          )}
        </h2>
        <p>
          {tr(
            "AI \u0438\u0437 \u043A\u043B\u0443\u0431\u0430 \u043F\u043E\u043C\u043E\u0436\u0435\u0442 \u0441\u0432\u044F\u0437\u0430\u0442\u044C \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u0441 \u0432\u0430\u0448\u0438\u043C \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u043E\u043C. \u041E\u0434\u043D\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0438\u0437 \u0434\u043D\u0435\u0432\u043D\u043E\u0433\u043E \u043B\u0438\u043C\u0438\u0442\u0430.",
          )}
        </p>
        <button
          className="secondary-button"
          onClick={discuss}
          disabled={busy || !config.data?.ai_enabled}
        >
          {tr(busy ? "Готовим ответ…" : "Обсудить с AI")}
        </button>
        {tr(
          !config.data?.ai_enabled && (
            <Link className="ghost-button" to="/assistant">
              {tr(
                "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u2197",
              )}
            </Link>
          ),
        )}
        {tr(
          reflection && (
            <p className="entry-text" role="status">
              {tr(reflection)}
            </p>
          ),
        )}
      </article>
    </section>
  );
}
