import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
import ReportCard from "../components/ReportCard";
export default function Dashboard() {
  const state = useLoad(api.dashboard);
  if (!state.data)
    return (
      <section className="section">
        <Status {...state} />
      </section>
    );
  const d = state.data,
    p = d.user.profile;
  const week = d.entries.slice(0, 7);
  return (
    <section className="section">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Всё важное — здесь</span>
          <h1>
            {d.user.name === "Гость"
              ? "Ваше пространство"
              : `Здравствуйте, ${d.user.name}.`}
          </h1>
          <p>
            Ваши записи, карта и материалы. Продолжайте с того места, где
            остановились.
          </p>
        </div>
        <Link className="secondary-button" to="/account">
          Аккаунт ↗
        </Link>
      </div>
      <div className="dashboard-grid">
        <article className="soft-card feature-card">
          <span className="chip">Карта чисел</span>
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
              <p>{p.arithmetic}</p>
              <small>{p.system}</small>
            </>
          ) : (
            <p>Пройдите бесплатный мини-разбор.</p>
          )}
          <Link className="ghost-button" to="/quiz">
            Обновить профиль
          </Link>
        </article>
        <article className="soft-card feature-card">
          <span className="chip">Обзор записей</span>
          <h2>{week.length} наблюдений</h2>
          <p>
            {week.filter((e) => e.done).length} отмеченных шагов в последних
            семи записях.
          </p>
          <p>Подумайте: что поддерживало вас и что стоит повторить?</p>
          <Link className="ghost-button" to="/journal">
            Вернуться к дневнику
          </Link>
        </article>
        <article className="soft-card feature-card tint-lavender">
          <span className="chip">
            {d.club ? "Клуб открыт" : "Numerologic Club"}
          </span>
          <h2>{d.club ? "В вашем темпе." : "Поддержка каждый день."}</h2>
          <p>
            {d.club
              ? `Доступ до ${new Date(d.expires).toLocaleDateString("ru-RU")}.`
              : "Все практики и AI-помощник. 1 000 ₽ за 30 дней."}
          </p>
          <Link className="ghost-button" to={d.club ? "/assistant" : "/club"}>
            {d.club ? "Поговорить с помощником" : "Посмотреть клуб"} ↗
          </Link>
        </article>
      </div>
      <div className="section-heading section">
        <h2>Ваши материалы</h2>
        <p>Разовые покупки остаются в кабинете после окончания клуба.</p>
      </div>
      <div className="reports-grid">
        {d.reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
        {!d.reports.length && (
          <article className="soft-card feature-card">
            <h3>Начните с бесплатной практики</h3>
            <p>
              Сначала попробуйте первый день — выберите материал по своему
              запросу.
            </p>
            <Link className="primary-button" to="/practices">
              Выбрать практику
            </Link>
          </article>
        )}
      </div>
    </section>
  );
}
