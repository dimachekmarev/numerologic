import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";

export default function Today() {
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
        {state.error && (
          <Link className="primary-button" to="/quiz">
            Заполнить профиль
          </Link>
        )}
      </section>
    );

  const d = state.data;
  const dateFormatted = new Date(d.date + "T12:00:00").toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });

  async function share() {
    const text = `Моя тема дня — ${d.theme}. ${d.practice} Numerologic: ${window.location.origin}${import.meta.env.BASE_URL}`;
    try {
      if (navigator.share)
        await navigator.share({ title: "Моя тема дня", text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
      api.track("share_daily");
    } catch {
      /* User can dismiss the share dialog. */
    }
  }

  return (
    <section className="section today-page">
      {/* HERO */}
      <div className="today-hero">
        <div className="today-hero-content">
          <span className="eyebrow">{dateFormatted}</span>
          <h1>Сегодня — для вас.</h1>
          <p className="today-lead">
            Без гонки. Без марафонов. Один маленький шаг, который поможет услышать себя.
          </p>
          <div className="today-actions">
            <button className="secondary-button" onClick={share}>
              {copied ? "✓ Скопировано" : "Поделиться темой ↗"}
            </button>
            <Link className="ghost-button" to="/journal">
              Открыть дневник
            </Link>
          </div>
        </div>
      </div>

      {/* DAILY GRID */}
      <div className="daily-grid">
        <article className="soft-card daily-main today-main-card">
          <span className="chip">Число дня</span>
          <div className="daily-number">{d.number}</div>
          <h2>{d.theme}</h2>
          <p className="daily-practice">{d.practice}</p>
          <div className="daily-actions">
            <Link className="primary-button cta-primary" to="/journal">
              Записать наблюдение →
            </Link>
            <Link className="secondary-button" to="/numbers">
              Моя карта чисел
            </Link>
          </div>
        </article>

        <article className="soft-card tarot-card today-tarot">
          <span className="chip">Карта как вопрос</span>
          <div className="tarot-symbol">✧</div>
          <h2>{d.tarot.name}</h2>
          <p className="tarot-question">{d.tarot.question}</p>
          <small>
            Символ дня выбран для вашего профиля. Это не предсказание — это вопрос для размышления.
          </small>
          <Link className="ghost-button" to="/journal">
            Записать ответ →
          </Link>
        </article>

        <article className="soft-card astro-card today-astro">
          <span className="chip">Астрологическая тема</span>
          <h2>{d.zodiac}</h2>
          <p>{d.astrology_note}</p>
          <Link className="ghost-button" to="/calendar">
            Темы месяца ↗
          </Link>
        </article>
      </div>

      {/* AI INSIGHT */}
      <article className="soft-card feature-card today-insight">
        <span className="chip">Персональное упражнение</span>
        <h2>Что важно именно вам?</h2>
        <p>
          AI подберёт вопрос с учётом вашего профиля и последних записей. 
          Входит в клуб и использует одно сообщение дневного лимита.
        </p>
        <div className="insight-actions">
          <button
            className="primary-button cta-primary"
            onClick={reflect}
            disabled={busy || !config.data?.ai_enabled}
          >
            {busy ? "⏳ Подбираем вопрос…" : "✨ Получить вопрос от AI"}
          </button>
          {!config.data?.ai_enabled && (
            <div className="ai-unavailable">
              <p>AI пока не подключён. Попробуйте готовые упражнения:</p>
              <Link className="secondary-button" to="/assistant">
                Выбрать упражнение ↗
              </Link>
            </div>
          )}
        </div>
        {insight && (
          <div className="insight-result" role="status">
            <span className="insight-icon">💭</span>
            <p className="entry-text">{insight}</p>
            <Link className="ghost-button" to="/journal">
              Записать мысли →
            </Link>
          </div>
        )}
      </article>

      {/* QUICK ACTIONS */}
      <div className="section-heading today-quick-heading">
        <span className="eyebrow">Что дальше?</span>
        <h2>Три способа продолжить</h2>
      </div>
      <div className="dashboard-grid today-quick-grid">
        <Link className="soft-card feature-card today-quick-card" to="/practices">
          <span className="quick-icon">🎯</span>
          <h3>Практика на 5 минут</h3>
          <p>Ясность, границы или спокойный диалог. Первый день бесплатно.</p>
          <span className="quick-cta">Выбрать практику →</span>
        </Link>
        <Link className="soft-card feature-card today-quick-card" to="/goals">
          <span className="quick-icon">✨</span>
          <h3>Мой маленький шаг</h3>
          <p>Поставьте цель, которую реально выполнить сегодня.</p>
          <span className="quick-cta">Поставить цель →</span>
        </Link>
        <Link className="soft-card feature-card today-quick-card" to="/assistant">
          <span className="quick-icon">🤖</span>
          <h3>Поговорить с помощником</h3>
          <p>Готовые упражнения и разговор с AI после подключения.</p>
          <span className="quick-cta">Начать разговор →</span>
        </Link>
      </div>

      {/* RETENTION CTA */}
      <div className="today-retention">
        <div className="soft-card retention-card">
          <div className="retention-content">
            <h3>Завтра будет новая тема</h3>
            <p>
              Возвращайтесь завтра — каждый день новое число, новая карта, новый вопрос.
              А через 7 дней получите автоматический обзор недели.
            </p>
          </div>
          <Link className="primary-button cta-primary" to="/weekly">
            Мой обзор недели →
          </Link>
        </div>
      </div>
    </section>
  );
}
