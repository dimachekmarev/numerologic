import { useI18n } from "../i18n";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
export default function Today() {
  const { t: tr } = useI18n();
  const state = useLoad(api.today);
  const config = useLoad(api.config);
  const [copied, setCopied] = useState(false);
  const [insight, setInsight] = useState("");
  const [busy, setBusy] = useState(false);
  async function reflect() {
    setBusy(true);
    try {
      const r = await api.insight();
      setInsight(r.reply);
    } catch (e) {
      setInsight(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!state.data)
    return (
      <section className="section">
        <Status {...state} />
        {tr(
          state.error && (
            <Link className="primary-button" to="/quiz">
              {tr(
                "\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u043F\u0440\u043E\u0444\u0438\u043B\u044C",
              )}
            </Link>
          ),
        )}
      </section>
    );
  const d = state.data;
  async function share() {
    const text = `Моя тема дня — ${d.theme}. ${d.practice} Numerologic: ${window.location.origin}${import.meta.env.BASE_URL}`;
    try {
      if (navigator.share)
        await navigator.share({
          title: "Моя тема дня",
          text,
        });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      }
      api.track("share_daily");
    } catch {
      /* User can dismiss the share dialog. */
    }
  }
  return (
    <section className="section">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">
            {tr(
              new Date(d.date + "T12:00:00").toLocaleDateString(
                localStorage.getItem("numerologic_language") === "en"
                  ? "en-US"
                  : "ru-RU",
                {
                  day: "numeric",
                  month: "long",
                  weekday: "long",
                },
              ),
            )}
          </span>
          <h1>
            {tr(
              "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u2014 \u0434\u043B\u044F \u0432\u0430\u0441.",
            )}
          </h1>
          <p>
            {tr(
              "\u0411\u0435\u0437 \u0433\u043E\u043D\u043A\u0438. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0434\u0438\u043D \u043D\u0435\u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0448\u0430\u0433.",
            )}
          </p>
        </div>
        <button className="secondary-button" onClick={share}>
          {tr(copied ? "Скопировано" : "Поделиться темой ↗")}
        </button>
      </div>
      <div className="daily-grid">
        <article className="soft-card daily-main">
          <span className="chip">
            {tr("\u0427\u0438\u0441\u043B\u043E \u0434\u043D\u044F")}
          </span>
          <div className="daily-number">{tr(d.number)}</div>
          <h2>{tr(d.theme)}</h2>
          <p>{tr(d.practice)}</p>
          <Link className="primary-button" to="/journal">
            {tr(
              "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u0435",
            )}
          </Link>
        </article>
        <article className="soft-card tarot-card">
          <span className="chip">
            {tr(
              "\u041A\u0430\u0440\u0442\u0430 \u043A\u0430\u043A \u0432\u043E\u043F\u0440\u043E\u0441",
            )}
          </span>
          <div className="tarot-symbol">✧</div>
          <h2>{tr(d.tarot.name)}</h2>
          <p>{tr(d.tarot.question)}</p>
          <small>
            {tr(
              "\u0421\u0438\u043C\u0432\u043E\u043B \u0434\u043D\u044F \u0432\u044B\u0431\u0440\u0430\u043D \u0434\u043B\u044F \u0432\u0430\u0448\u0435\u0433\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044F. \u042D\u0442\u043E \u043D\u0435 \u043F\u0440\u0435\u0434\u0441\u043A\u0430\u0437\u0430\u043D\u0438\u0435.",
            )}
          </small>
        </article>
        <article className="soft-card astro-card">
          <span className="chip">
            {tr(
              "\u0410\u0441\u0442\u0440\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0442\u0435\u043C\u0430",
            )}
          </span>
          <h2>{tr(d.zodiac)}</h2>
          <p>{tr(d.astrology_note)}</p>
          <Link className="ghost-button" to="/calendar">
            {tr(
              "\u0422\u0435\u043C\u044B \u043C\u0435\u0441\u044F\u0446\u0430 \u2197",
            )}
          </Link>
        </article>
      </div>
      <article
        className="soft-card feature-card"
        style={{
          marginTop: 24,
        }}
      >
        <span className="chip">
          {tr(
            "\u0412\u043E\u043F\u0440\u043E\u0441 \u0434\u043B\u044F \u0440\u0430\u0437\u043C\u044B\u0448\u043B\u0435\u043D\u0438\u044F",
          )}
        </span>
        <h2>
          {tr(
            "\u0427\u0442\u043E \u0432\u0430\u0436\u043D\u043E \u0438\u043C\u0435\u043D\u043D\u043E \u0432\u0430\u043C?",
          )}
        </h2>
        <p>
          {tr(
            "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0435 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u0441 \u0443\u0447\u0451\u0442\u043E\u043C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0437\u0430\u043F\u0438\u0441\u0435\u0439. \u0412\u0445\u043E\u0434\u0438\u0442 \u0432 \u043A\u043B\u0443\u0431 \u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 \u043E\u0434\u043D\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0434\u043D\u0435\u0432\u043D\u043E\u0433\u043E \u043B\u0438\u043C\u0438\u0442\u0430.",
          )}
        </p>
        <button
          className="primary-button"
          onClick={reflect}
          disabled={busy || !config.data?.ai_enabled}
        >
          {tr(busy ? "Подбираем вопрос…" : "Получить вопрос от AI")}
        </button>
        {tr(
          !config.data?.ai_enabled && (
            <Link className="secondary-button" to="/assistant">
              {tr(
                "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0435 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u2197",
              )}
            </Link>
          ),
        )}
        {tr(
          insight && (
            <p className="entry-text" role="status">
              {tr(insight)}
            </p>
          ),
        )}
      </article>
      <div className="dashboard-grid section">
        <Link className="soft-card feature-card" to="/practices">
          <h3>
            {tr(
              "\u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 \u043D\u0430 5 \u043C\u0438\u043D\u0443\u0442 \u2197",
            )}
          </h3>
          <p>
            {tr(
              "\u042F\u0441\u043D\u043E\u0441\u0442\u044C, \u0433\u0440\u0430\u043D\u0438\u0446\u044B \u0438\u043B\u0438 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439 \u0434\u0438\u0430\u043B\u043E\u0433.",
            )}
          </p>
        </Link>
        <Link className="soft-card feature-card" to="/goals">
          <h3>
            {tr(
              "\u041C\u043E\u0439 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0439 \u0448\u0430\u0433 \u2197",
            )}
          </h3>
          <p>
            {tr(
              "\u041F\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0446\u0435\u043B\u044C, \u043A\u043E\u0442\u043E\u0440\u0443\u044E \u0440\u0435\u0430\u043B\u044C\u043D\u043E \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C.",
            )}
          </p>
        </Link>
        <Link className="soft-card feature-card" to="/assistant">
          <h3>
            {tr(
              "\u041F\u043E\u0433\u043E\u0432\u043E\u0440\u0438\u0442\u044C \u0441 \u043F\u043E\u043C\u043E\u0449\u043D\u0438\u043A\u043E\u043C \u2197",
            )}
          </h3>
          <p>
            {tr(
              "\u0413\u043E\u0442\u043E\u0432\u044B\u0435 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u044F \u0438 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440 \u0441 AI \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F.",
            )}
          </p>
        </Link>
      </div>
    </section>
  );
}
