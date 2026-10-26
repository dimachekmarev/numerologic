import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
import ReportCard from "../components/ReportCard";
import TrialAccess from "../components/TrialAccess";

export default function Dashboard() {
  const state = useLoad(api.dashboard),
    week = useLoad(api.weekly);

  if (!state.data)
    return (
      <section className="section">
        <Status {...state} />
      </section>
    );

  const d = state.data,
    p = d.user.profile;
  const streak = week.data?.streak || 0;
  const entries = week.data?.entries || 0;
  const steps = week.data?.steps || 0;
  const isSetup = p && d.user.registered;

  return (
    <section className="section dashboard-page">
      {/* HERO */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="eyebrow">Ваше личное пространство</span>
          <h1>
            {d.user.name === "Гость"
              ? "Начните с себя."
              : `${d.user.name}, добро пожаловать.`}
          </h1>
          <p>Карта, мысли и маленькие шаги — всё сохраняется здесь.</p>
        </div>
        <Link className="secondary-button" to="/account">
          Настройки ↗
        </Link>
      </div>

      {/* SETUP CARD */}
      {(!p || !d.user.registered) && (
        <article className="soft-card setup-card setup-enhanced">
          <span className="setup-icon">✨</span>
          <h2>Два шага, чтобы начать</h2>
          <p className="setup-desc">
            Заполните профиль и сохраните аккаунт — получите 7 дней полного доступа бесплатно.
          </p>
          <div className="setup-steps">
            <Link
              className={`setup-step ${p ? "done" : ""}`}
              to="/quiz"
            >
              <span className="setup-step-number">{p ? "✓" : "1"}</span>
              <div>
                <strong>Заполнить профиль</strong>
                <small>Имя, дата рождения, фокус</small>
              </div>
            </Link>
            <Link
              className={`setup-step ${d.user.registered ? "done" : ""}`}
              to="/account"
            >
              <span className="setup-step-number">{d.user.registered ? "✓" : "2"}</span>
              <div>
                <strong>Сохранить аккаунт</strong>
                <small>Для доступа на других устройствах</small>
              </div>
            </Link>
          </div>
          <p className="setup-note">
            В гостевом режиме записи привязаны к этому браузеру. 
            Сохраните аккаунт для входа на других устройствах.
          </p>
        </article>
      )}

      {/* STREAK & STATS */}
      {isSetup && (
        <div className="stats-row">
          <div className="soft-card stat-card stat-streak">
            <span className="stat-icon">🔥</span>
            <div>
              <strong className="stat-value">{streak}</strong>
              <span className="stat-label">дней подряд</span>
            </div>
          </div>
          <div className="soft-card stat-card stat-entries">
            <span className="stat-icon">📝</span>
            <div>
              <strong className="stat-value">{entries}</strong>
              <span className="stat-label">записей за неделю</span>
            </div>
          </div>
          <div className="soft-card stat-card stat-steps">
            <span className="stat-icon">✨</span>
            <div>
              <strong className="stat-value">{steps}</strong>
              <span className="stat-label">шагов выполнено</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="dashboard-grid dashboard-main-grid">
        <Link className="soft-card feature-card map-preview" to="/numbers">
          <span className="chip">Моя карта чисел</span>
          {p ? (
            <>
              <div className="numbers-row">
                <div>
                  <strong>{p.life_path}</strong>
                  <span>путь</span>
                </div>
                <div>
                  <strong>{p.month}</strong>
                  <span>месяц</span>
                </div>
              </div>
              <h3>{p.meaning}</h3>
              <p className="arithmetic">{p.arithmetic}</p>
            </>
          ) : (
            <p>Имя и дата рождения — начало вашей карты.</p>
          )}
          <span className="card-cta">Открыть карту →</span>
        </Link>

        <Link className="soft-card feature-card weekly-preview" to="/weekly">
          <span className="chip">Моя неделя</span>
          <div className="weekly-preview-stats">
            <div className="weekly-stat">
              <strong>{entries}</strong>
              <span>наблюдений</span>
            </div>
            <div className="weekly-stat">
              <strong>{steps}</strong>
              <span>шагов</span>
            </div>
            <div className="weekly-stat">
              <strong>{streak}</strong>
              <span>дней подряд</span>
            </div>
          </div>
          <p>
            Замечайте паттерны: что помогало, что повторялось, 
            куда двигаться дальше.
          </p>
          <span className="card-cta">Посмотреть обзор →</span>
        </Link>

        <article className="soft-card feature-card tint-lavender today-card">
          <span className="chip">Продолжить сегодня</span>
          <h2>Пять минут для себя.</h2>
          <p>
            Посмотрите тему дня, выберите упражнение и сохраните одну мысль.
          </p>
          <div className="today-actions-grid">
            <Link className="primary-button cta-primary" to="/today">
              Мой день →
            </Link>
            <Link className="ghost-button" to="/journal">
              Открыть дневник
            </Link>
          </div>
        </article>
      </div>

      <TrialAccess onChanged={state.reload} />

      {/* MATERIALS */}
      <div className="section-heading section materials-heading">
        <span className="eyebrow">Ваши материалы</span>
        <h2>Сформированные отчёты и PDF</h2>
        <p>Всё сохраняется в кабинете. Доступно в любой момент.</p>
      </div>
      <div className="reports-grid">
        {d.reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
        {!d.reports.length && (
          <article className="soft-card feature-card empty-materials">
            <span className="empty-icon">📚</span>
            <h3>Выберите первый материал</h3>
            <p>
              Практикумы, карта периода, годовые прогнозы и вопросы для диалога.
              Попробуйте 7 дней бесплатно — все материалы включены.
            </p>
            <div className="hero-actions">
              <Link className="primary-button cta-primary" to="/products">
                Посмотреть материалы →
              </Link>
              <Link className="secondary-button" to="/club">
                Что в клубе
              </Link>
            </div>
          </article>
        )}
      </div>

      {/* QUICK LINKS */}
      <div className="dashboard-quick-links">
        <h3>Быстрые ссылки</h3>
        <div className="quick-links-grid">
          <Link to="/journal" className="quick-link">📝 Дневник</Link>
          <Link to="/goals" className="quick-link">✨ Цели</Link>
          <Link to="/calendar" className="quick-link">📅 Календарь</Link>
          <Link to="/practices" className="quick-link">🎯 Практики</Link>
          <Link to="/assistant" className="quick-link">🤖 Помощник</Link>
          <Link to="/compatibility" className="quick-link">💕 Совместимость</Link>
        </div>
      </div>
    </section>
  );
}
