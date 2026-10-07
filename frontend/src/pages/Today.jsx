import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
export default function Today() {
  const state = useLoad(api.today);
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
        {state.error && (
          <Link className="primary-button" to="/quiz">
            Заполнить профиль
          </Link>
        )}
      </section>
    );
  const d = state.data;
  async function share() {
    const text = `Моя тема дня — ${d.theme}. ${d.practice} Numerologic: ${window.location.origin}${import.meta.env.BASE_URL}`;
    try {
      if (navigator.share)
        await navigator.share({ title: "Моя тема дня", text });
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
            {new Date(d.date + "T12:00:00").toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              weekday: "long",
            })}
          </span>
          <h1>Сегодня — для вас.</h1>
          <p>Без гонки. Выберите один небольшой шаг.</p>
        </div>
        <button className="secondary-button" onClick={share}>
          {copied ? "Скопировано" : "Поделиться темой ↗"}
        </button>
      </div>
      <div className="daily-grid">
        <article className="soft-card daily-main">
          <span className="chip">Число дня</span>
          <div className="daily-number">{d.number}</div>
          <h2>{d.theme}</h2>
          <p>{d.practice}</p>
          <Link className="primary-button" to="/journal">
            Записать наблюдение
          </Link>
        </article>
        <article className="soft-card tarot-card">
          <span className="chip">Карта как вопрос</span>
          <div className="tarot-symbol">✧</div>
          <h2>{d.tarot.name}</h2>
          <p>{d.tarot.question}</p>
          <small>
            Символ дня выбран для вашего профиля. Это не предсказание.
          </small>
        </article>
        <article className="soft-card astro-card">
          <span className="chip">Астрологическая тема</span>
          <h2>{d.zodiac}</h2>
          <p>{d.astrology_note}</p>
          <Link className="ghost-button" to="/calendar">
            Темы месяца ↗
          </Link>
        </article>
      </div>
      <article className="soft-card feature-card" style={{ marginTop: 24 }}>
        <span className="chip">AI-размышление</span>
        <h2>Что важно именно вам?</h2>
        <p>
          Персональное упражнение с учётом последних записей. Входит в клуб и
          использует одно сообщение дневного лимита.
        </p>
        <button className="primary-button" onClick={reflect} disabled={busy}>
          {busy ? "Подбираем вопрос…" : "Получить вопрос от AI"}
        </button>
        {insight && (
          <p className="entry-text" role="status">
            {insight}
          </p>
        )}
      </article>
      <div className="dashboard-grid section">
        <Link className="soft-card feature-card" to="/practices">
          <h3>Практика на 5 минут ↗</h3>
          <p>Ясность, границы или спокойный диалог.</p>
        </Link>
        <Link className="soft-card feature-card" to="/goals">
          <h3>Мой маленький шаг ↗</h3>
          <p>Поставьте цель, которую реально выполнить.</p>
        </Link>
        <Link className="soft-card feature-card" to="/assistant">
          <h3>Поговорить с помощником ↗</h3>
          <p>AI учитывает профиль и записи дневника.</p>
        </Link>
      </div>
    </section>
  );
}
