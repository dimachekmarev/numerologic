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
  return (
    <section className="section">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Ваше личное пространство</span>
          <h1>
            {d.user.name === "Гость"
              ? "Начните с себя."
              : `${d.user.name}, добро пожаловать.`}
          </h1>
          <p>Карта, мысли и маленькие шаги — всё сохраняется здесь.</p>
        </div>
        <Link className="secondary-button" to="/account">
          Настройки аккаунта ↗
        </Link>
      </div>
      {(!p || !d.user.registered) && (
        <article className="soft-card setup-card">
          <h3>Два шага, чтобы начать</h3>
          <div className="hero-actions">
            <Link
              className={p ? "secondary-button" : "primary-button"}
              to="/quiz"
            >
              {p ? "✓" : "01"} Заполнить профиль
            </Link>
            <Link
              className={
                d.user.registered ? "secondary-button" : "primary-button"
              }
              to="/account"
            >
              {d.user.registered ? "✓" : "02"} Сохранить аккаунт
            </Link>
          </div>
          <p>
            В гостевом режиме записи привязаны к этому браузеру. Сохраните
            аккаунт для входа на других устройствах.
          </p>
        </article>
      )}
      <div className="dashboard-grid">
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
              <p>{p.arithmetic}</p>
            </>
          ) : (
            <p>Имя и дата рождения — начало вашей карты.</p>
          )}
          <span className="ghost-button">Открыть карту ↗</span>
        </Link>
        <Link className="soft-card feature-card" to="/weekly">
          <span className="chip">Моя неделя</span>
          <h2>{week.data?.entries || 0} наблюдений</h2>
          <p>
            {week.data?.steps || 0} шагов за последние семь дней.{" "}
            {week.data?.streak || 0} дней записей подряд.
          </p>
          <span className="ghost-button">Посмотреть обзор ↗</span>
        </Link>
        <article className="soft-card feature-card tint-lavender">
          <span className="chip">Продолжить сегодня</span>
          <h2>Пять минут для себя.</h2>
          <p>
            Посмотрите тему дня, выберите упражнение и сохраните одну мысль.
          </p>
          <Link className="primary-button" to="/today">
            Мой день ↗
          </Link>
          <Link className="ghost-button" to="/journal">
            Открыть дневник
          </Link>
        </article>
      </div>
      <TrialAccess onChanged={state.reload} />
      <div className="section-heading section">
        <h2>Ваши материалы</h2>
        <p>Сформированные материалы и PDF сохраняются в кабинете.</p>
      </div>
      <div className="reports-grid">
        {d.reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
        {!d.reports.length && (
          <article className="soft-card feature-card">
            <h3>Выберите первый материал</h3>
            <p>Практикумы, карта периода и вопросы для диалога.</p>
            <Link className="primary-button" to="/products">
              Посмотреть материалы ↗
            </Link>
          </article>
        )}
      </div>
    </section>
  );
}
