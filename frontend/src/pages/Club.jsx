import { Link } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../api";
import TrialAccess from "../components/TrialAccess";
export default function Club() {
  useEffect(() => {
    api.track("club_viewed");
  }, []);
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">Numerologic Club</span>
        <h1>
          Место, где можно
          <br />
          <em>услышать себя.</em>
        </h1>
        <p>
          Ежедневные инструменты плюс поддержка, к которой можно вернуться в
          нужный момент.
        </p>
      </div>
      <TrialAccess />
      <div className="section-grid">
        <article className="soft-card club-price feature-card">
          <span className="chip">30 дней доступа</span>
          <h2>1 000 ₽</h2>
          <p>Продление вручную. Вы сами решаете, когда продолжать.</p>
          <Link className="primary-button" to="/checkout?product=club">
            Вступить в клуб ↗
          </Link>
          <Link className="ghost-button" to="/practices">
            Сначала попробовать практику
          </Link>
        </article>
        <div className="feature-stack">
          {[
            [
              "Все практикумы",
              "Границы, ясность, диалог и мягкий фокус. Пошаговые упражнения с отметками прогресса.",
            ],
            [
              "AI-помощник с контекстом",
              "До 10 сообщений в день. Помнит контекст профиля и последних записей при вашем обращении.",
            ],
            [
              "Карта периода и PDF",
              "Личный отчёт с прозрачной арифметикой, темами месяца и планом небольших действий.",
            ],
            [
              "Обзор недели",
              "Дневник, настроение, цели и выполненные практики. Замечайте то, что помогает именно вам.",
            ],
          ].map(([t, p]) => (
            <article key={t}>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </div>
      <p className="small-note">
        AI становится доступен после подключения поставщика владельцем сервиса.
        Дневник, цели, тема дня и первый день практикумов остаются бесплатными.
      </p>
    </section>
  );
}
