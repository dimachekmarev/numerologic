import { useI18n } from "../i18n";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
import ReportCard from "../components/ReportCard";
import TrialAccess from "../components/TrialAccess";
export default function Dashboard() {
  const { t: tr, language } = useI18n();
  const en = language === "en";
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
      <div className="cozy-dashboard">
        <div className="cozy-dashboard-copy">
          <span className="cozy-eyebrow">
            {new Date().toLocaleDateString(en ? "en-US" : "ru-RU", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
          <h1>
            {d.user.name === "Гость"
              ? en
                ? "Make yourself at home."
                : "Побудьте немного с собой."
              : en
                ? `A little time for you, ${d.user.name}.`
                : `${d.user.name}, это время для вас.`}
          </h1>
          <p>
            {en
              ? "No need to rush. Choose one thought, one gentle practice or one small step for today."
              : "Можно без спешки. Выберите одну мысль, одну бережную практику или один маленький шаг на сегодня."}
          </p>
          <Link className="cozy-text-link" to="/journal">
            {en
              ? "How are you feeling today?"
              : "Как вы сегодня себя чувствуете?"}{" "}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="cozy-dashboard-image">
          <img
            src={`${import.meta.env.BASE_URL}quiet-morning.webp`}
            alt=""
            width="1122"
            height="1402"
          />
        </div>
      </div>
      {tr(
        (!p || !d.user.registered) && (
          <article className="soft-card setup-card">
            <h3>
              {tr(
                "\u0414\u0432\u0430 \u0448\u0430\u0433\u0430, \u0447\u0442\u043E\u0431\u044B \u043D\u0430\u0447\u0430\u0442\u044C",
              )}
            </h3>
            <div className="hero-actions">
              <Link
                className={p ? "secondary-button" : "primary-button"}
                to="/quiz"
              >
                {tr(p ? "✓" : "01")}
                {tr(
                  "\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u043F\u0440\u043E\u0444\u0438\u043B\u044C",
                )}
              </Link>
              <Link
                className={
                  d.user.registered ? "secondary-button" : "primary-button"
                }
                to="/account"
              >
                {tr(d.user.registered ? "✓" : "02")}
                {tr(
                  "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442",
                )}
              </Link>
            </div>
            <p>
              {tr(
                "\u0412 \u0433\u043E\u0441\u0442\u0435\u0432\u043E\u043C \u0440\u0435\u0436\u0438\u043C\u0435 \u0437\u0430\u043F\u0438\u0441\u0438 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u044B \u043A \u044D\u0442\u043E\u043C\u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0443. \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430 \u043D\u0430 \u0434\u0440\u0443\u0433\u0438\u0445 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430\u0445.",
              )}
            </p>
          </article>
        ),
      )}
      <div className="dashboard-grid">
        <Link className="soft-card feature-card map-preview" to="/numbers">
          <span className="chip">
            {tr(
              "\u041C\u043E\u044F \u043A\u0430\u0440\u0442\u0430 \u0447\u0438\u0441\u0435\u043B",
            )}
          </span>
          {tr(
            p ? (
              <>
                <div className="numbers-row">
                  <div>
                    <strong>{tr(p.life_path)}</strong>
                    <span>{tr("\u043F\u0443\u0442\u044C")}</span>
                  </div>
                  <div>
                    <strong>{tr(p.month)}</strong>
                    <span>{tr("\u043C\u0435\u0441\u044F\u0446")}</span>
                  </div>
                </div>
                <h3>{tr(p.meaning)}</h3>
                <p>{tr(p.arithmetic)}</p>
              </>
            ) : (
              <p>
                {tr(
                  "\u0418\u043C\u044F \u0438 \u0434\u0430\u0442\u0430 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u2014 \u043D\u0430\u0447\u0430\u043B\u043E \u0432\u0430\u0448\u0435\u0439 \u043A\u0430\u0440\u0442\u044B.",
                )}
              </p>
            ),
          )}
          <span className="ghost-button">
            {tr(
              "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0440\u0442\u0443 \u2197",
            )}
          </span>
        </Link>
        <Link className="soft-card feature-card" to="/weekly">
          <span className="chip">
            {tr("\u041C\u043E\u044F \u043D\u0435\u0434\u0435\u043B\u044F")}
          </span>
          <h2>
            {tr(week.data?.entries || 0)}
            {tr("\u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u0439")}
          </h2>
          <p>
            {tr(week.data?.steps || 0)}
            {tr(
              "\u0448\u0430\u0433\u043E\u0432 \u0437\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0441\u0435\u043C\u044C \u0434\u043D\u0435\u0439.",
            )}
            {tr(" ")}
            {tr(week.data?.streak || 0)}
            {tr(
              "\u0434\u043D\u0435\u0439 \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u043F\u043E\u0434\u0440\u044F\u0434.",
            )}
          </p>
          <span className="ghost-button">
            {tr(
              "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043E\u0431\u0437\u043E\u0440 \u2197",
            )}
          </span>
        </Link>
        <article className="soft-card feature-card tint-lavender">
          <span className="chip">
            {tr(
              "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0441\u0435\u0433\u043E\u0434\u043D\u044F",
            )}
          </span>
          <h2>
            {tr(
              "\u041F\u044F\u0442\u044C \u043C\u0438\u043D\u0443\u0442 \u0434\u043B\u044F \u0441\u0435\u0431\u044F.",
            )}
          </h2>
          <p>
            {tr(
              "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0438\u0442\u0435 \u0442\u0435\u043C\u0443 \u0434\u043D\u044F, \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0435 \u043E\u0434\u043D\u0443 \u043C\u044B\u0441\u043B\u044C.",
            )}
          </p>
          <Link className="primary-button" to="/today">
            {tr("\u041C\u043E\u0439 \u0434\u0435\u043D\u044C \u2197")}
          </Link>
          <Link className="ghost-button" to="/journal">
            {tr(
              "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0434\u043D\u0435\u0432\u043D\u0438\u043A",
            )}
          </Link>
        </article>
      </div>
      <div className="hero-actions section">
        <Link className="primary-button" to="/rituals">
          {tr("Мои ритуалы и месяц")} ↗
        </Link>
        <Link className="secondary-button" to="/practices/self-discovery-30">
          {tr("30 дней для себя")} ↗
        </Link>
      </div>
      <TrialAccess onChanged={state.reload} />
      <div className="section-heading section">
        <h2>
          {tr(
            "\u0412\u0430\u0448\u0438 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B",
          )}
        </h2>
        <p>
          {tr(
            "\u0421\u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u0438 PDF \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0432 \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u0435.",
          )}
        </p>
      </div>
      <div className="reports-grid">
        {tr(d.reports.map((r) => <ReportCard key={r.id} report={r} />))}
        {tr(
          !d.reports.length && (
            <article className="soft-card feature-card">
              <h3>
                {tr(
                  "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0435\u0440\u0432\u044B\u0439 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B",
                )}
              </h3>
              <p>
                {tr(
                  "\u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0443\u043C\u044B, \u043A\u0430\u0440\u0442\u0430 \u043F\u0435\u0440\u0438\u043E\u0434\u0430 \u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0434\u043B\u044F \u0434\u0438\u0430\u043B\u043E\u0433\u0430.",
                )}
              </p>
              <Link className="primary-button" to="/products">
                {tr(
                  "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u2197",
                )}
              </Link>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
