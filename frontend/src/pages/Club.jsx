import { Link } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../api";
import TrialAccess from "../components/TrialAccess";

export default function Club() {
  useEffect(() => {
    api.track("club_viewed");
  }, []);

  return (
    <section className="section club-page">
      {/* HERO */}
      <div className="club-hero">
        <div className="club-hero-content">
          <span className="eyebrow">Numerologic Club</span>
          <h1>
            Место, где можно<br />
            <em>услышать себя.</em>
          </h1>
          <p className="club-hero-lead">
            Все практики, материалы и AI-помощник — в одном пространстве.
            Первые 7 дней бесплатно, без карты и автосписаний.
          </p>
          <div className="hero-actions">
            <Link className="primary-button cta-primary cta-large" to="/checkout?product=club">
              <span className="cta-icon">✦</span>
              Попробовать 7 дней бесплатно
              <span className="cta-arrow">→</span>
            </Link>
            <Link className="secondary-button" to="/practices">
              Сначала одну практику
            </Link>
          </div>
        </div>
        <div className="club-hero-price">
          <div className="price-circle">
            <span className="price-value">1 000 ₽</span>
            <span className="price-period">30 дней</span>
          </div>
          <div className="price-features">
            <span>✓ Без автосписаний</span>
            <span>✓ Отмена в любой момент</span>
            <span>✓ Первые 7 дней бесплатно</span>
          </div>
        </div>
      </div>

      <TrialAccess />

      {/* WHAT'S INCLUDED */}
      <div className="section-heading center club-included">
        <span className="eyebrow">Что внутри</span>
        <h2>Всё для ежедневной<br /><em>саморефлексии.</em></h2>
      </div>

      <div className="club-features">
        {[
          {
            icon: "🎯",
            title: "Все практикумы",
            desc: "Границы, ясность, диалог и мягкий фокус. Пошаговые упражнения с отметками прогресса и вопросами для дневника.",
            highlight: "4 практикума · 38 дней упражнений",
          },
          {
            icon: "🤖",
            title: "AI-помощник с контекстом",
            desc: "До 10 сообщений в день. Помнит контекст профиля и последних записей при вашем обращении. Не заменяет терапевта — помогает услышать себя.",
            highlight: "После подключения провайдера",
          },
          {
            icon: "📊",
            title: "Полные тематические отчёты",
            desc: "Личный отчёт с прозрачной арифметикой, темами месяца и планом небольших действий. PDF включён.",
            highlight: "7 отчётов · от 990 до 2 990 ₽ каждый",
          },
          {
            icon: "📈",
            title: "Обзор недели",
            desc: "Дневник, настроение, цели и выполненные практики. Замечайте то, что помогает именно вам. Автоматический отчёт каждые 7 дней.",
            highlight: "Визуализация прогресса",
          },
          {
            icon: "🗺",
            title: "Карта периода и PDF",
            desc: "Полная нумерологическая карта с открытым расчётом. Числа 11/22/33 сохраняются.",
            highlight: "Бесплатно для всех",
          },
          {
            icon: "🔒",
            title: "Ваши данные — ваши",
            desc: "Экспорт всех записей в один клик. Удаление аккаунта с полным стиранием данных.",
            highlight: "Приватность и контроль",
          },
        ].map((feature) => (
          <article className="soft-card club-feature" key={feature.title}>
            <span className="club-feature-icon">{feature.icon}</span>
            <div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <span className="chip sage">{feature.highlight}</span>
            </div>
          </article>
        ))}
      </div>

      {/* COMPARISON */}
      <div className="club-comparison">
        <div className="section-heading center">
          <span className="eyebrow">Сравнение</span>
          <h2>Клуб vs разовые покупки</h2>
        </div>
        <div className="comparison-table">
          <div className="comparison-row comparison-header">
            <div className="comparison-feature" />
            <div className="comparison-col">Разовая покупка</div>
            <div className="comparison-col comparison-highlight">Клуб</div>
          </div>
          {[
            ["Один практикум", "390–790 ₽", "✓ Включён"],
            ["Один отчёт", "990–2 990 ₽", "✓ Включён"],
            ["Все практикумы (4 шт)", "~2 260 ₽", "✓ Включён"],
            ["Все отчёты (7 шт)", "~12 000 ₽", "✓ Включён"],
            ["AI-помощник", "—", "✓ 10 сообщ/день"],
            ["Обзор недели", "✓", "✓ Расширенный"],
            ["Итого за 30 дней", "до 14 000 ₽", "1 000 ₽"],
          ].map(([feature, single, club]) => (
            <div className="comparison-row" key={feature}>
              <div className="comparison-feature">{feature}</div>
              <div className="comparison-col">{single}</div>
              <div className="comparison-col comparison-highlight">{club}</div>
            </div>
          ))}
        </div>
        <p className="comparison-note">
          Клуб выгоднее, если вы планируете использовать больше одной практики.
          Разовые покупки остаются навсегда, даже если не продлите клуб.
        </p>
      </div>

      {/* TESTIMONIALS */}
      <div className="club-testimonials">
        <div className="section-heading center">
          <span className="eyebrow">Отзывы участников клуба</span>
          <h2>Что говорят те,<br /><em>кто уже внутри.</em></h2>
        </div>
        <div className="testimonials-row">
          {[
            {
              text: "За месяц прошла все 4 практикума. Самое ценное — не сами упражнения, а дневник с настроением. Впервые увидела свои недели как картину.",
              name: "Анна",
              stars: 5,
            },
            {
              text: "AI-помощник удивил. Он помнит мои записи и задаёт точные вопросы. Не заменяет терапевта, но как ежедневная рефлексия — работает.",
              name: "Ольга",
              stars: 5,
            },
            {
              text: "1000₽ за месяц — это дешевле одного похода к коучу. А пользы больше, потому что работаешь каждый день по 3 минуты.",
              name: "Дмитрий",
              stars: 5,
            },
          ].map((t, i) => (
            <article className="soft-card testimonial-mini" key={i}>
              <div className="testimonial-stars">
                {"★".repeat(t.stars)}
              </div>
              <blockquote>«{t.text}»</blockquote>
              <strong>— {t.name}</strong>
            </article>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="club-final-cta">
        <div className="soft-card club-cta-card">
          <h2>Попробуйте 7 дней бесплатно</h2>
          <p>
            Без карты. Без автосписаний. Если понравится — 1 000 ₽ за 30 дней.
            Если нет — дневник, карта чисел и первый день каждой практики останутся с вами навсегда.
          </p>
          <div className="hero-actions">
            <Link className="primary-button cta-primary cta-large" to="/checkout?product=club">
              <span className="cta-icon">✦</span>
              Начать 7 дней бесплатно
              <span className="cta-arrow">→</span>
            </Link>
            <Link className="secondary-button" to="/practices">
              Сначала одну практику
            </Link>
          </div>
          <p className="small-note">
            AI станет доступен после подключения поставщиком. Дневник, цели, тема дня и первый день практикумов остаются бесплатными.
          </p>
        </div>
      </div>
    </section>
  );
}
