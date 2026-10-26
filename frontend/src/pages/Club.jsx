import { Link } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../api";
import TrialAccess from "../components/TrialAccess";
import { CLUB_CONTENT, CLUB_EXCLUSIVES, CLUB_PRICING } from "../data/clubContent";

export default function Club() {
  useEffect(() => {
    api.track("club_viewed");
  }, []);

  const pricing = CLUB_PRICING.RU; // TODO: detect locale

  return (
    <section className="section club-page-enhanced">
      {/* HERO */}
      <div className="club-hero-enhanced">
        <div className="club-hero-content">
          <span className="eyebrow">Numerologic Club</span>
          <h1>
            Не приложение.<br />
            <em>Привычка слышать себя.</em>
          </h1>
          <p className="club-hero-lead">
            52 недели контента. Еженедельные практики, медитации и мастер-классы.
            Не просто доступ — программа трансформации.
          </p>
          <div className="club-hero-cta">
            <Link className="primary-button cta-primary cta-large" to="/checkout?product=club">
              <span className="cta-icon">✦</span>
              Попробовать 7 дней бесплатно
              <span className="cta-arrow">→</span>
            </Link>
            <p className="club-hero-note">Без карты · без автосписаний · отмена в любой момент</p>
          </div>
        </div>
        <div className="club-hero-visual">
          <div className="club-price-circle">
            <span className="club-price-value">{pricing.monthly} {pricing.currency}</span>
            <span className="club-price-period">в месяц</span>
          </div>
          <div className="club-price-options">
            <span>Квартал: {pricing.quarterly} {pricing.currency} <small>(-16%)</small></span>
            <span>Год: {pricing.yearly} {pricing.currency} <small>(-33%)</small></span>
          </div>
        </div>
      </div>

      <TrialAccess />

      {/* ЧТО ВЫ ПОЛУЧАЕТЕ */}
      <div className="club-value-section">
        <div className="section-heading center">
          <span className="eyebrow">Не просто доступ</span>
          <h2>52 недели<br /><em>программы.</em></h2>
          <p className="section-subtitle">
            Каждую неделю — новый материал. Не коллекция статей, а последовательное путешествие.
          </p>
        </div>

        {/* ПЛАН НА 6 МЕСЯЦЕВ */}
        <div className="club-roadmap">
          {Object.entries(CLUB_CONTENT).slice(0, 6).map(([key, month], i) => (
            <div className="club-month" key={key}>
              <div className="club-month-header">
                <span className="club-month-number">{i + 1}</span>
                <div>
                  <h3>Месяц {i + 1}: {month.theme}</h3>
                  <small>4 недели · 4 материала</small>
                </div>
              </div>
              <div className="club-month-weeks">
                {month.weeks.map((week, wi) => (
                  <div className="club-week-card" key={wi}>
                    <span className="club-week-type">{week.type}</span>
                    <h4>{week.title}</h4>
                    <p>{week.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ЭКСКЛЮЗИВНЫЕ МАТЕРИАЛЫ */}
      <div className="club-exclusives-section">
        <div className="section-heading center">
          <span className="eyebrow">Только в клубе</span>
          <h2>Эксклюзивные<br /><em>инструменты.</em></h2>
        </div>
        <div className="club-exclusives-grid">
          {CLUB_EXCLUSIVES.map((item, i) => (
            <div className="soft-card club-exclusive-card" key={i}>
              <span className="exclusive-icon">{item.icon}</span>
              <div>
                <h4>{item.title}</h4>
                <small>{item.duration || item.format || `${item.lessons} уроков`}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* СРАВНЕНИЕ */}
      <div className="club-comparison-enhanced">
        <div className="section-heading center">
          <span className="eyebrow">Честное сравнение</span>
          <h2>Клуб vs<br /><em>бесплатно.</em></h2>
        </div>
        <div className="comparison-table-enhanced">
          <div className="comparison-header-enhanced">
            <div />
            <div>Бесплатно</div>
            <div className="highlight">Клуб</div>
          </div>
          {[
            ["Карта чисел + PDF", "✓", "✓"],
            ["Дневник, цели, календарь", "✓", "✓"],
            ["Тема дня", "✓", "✓"],
            ["Первый день практик", "✓", "✓"],
            ["Обзор недели", "Базовый", "Расширенный + инсайты"],
            ["Все 4 практикума", "—", "✓ Включены"],
            ["Все 7 отчётов", "—", "✓ Включены"],
            ["AI-помощник", "—", "✓ 10 сообщ/день"],
            ["Еженедельный новый контент", "—", "✓ 52 недели"],
            ["Медитации и аудио", "—", "✓ Эксклюзив"],
            ["Шаблоны и воркшиты", "—", "✓ PDF библиотека"],
            ["Персональные рекомендации", "—", "✓ На основе записей"],
          ].map(([feature, free, club], i) => (
            <div className="comparison-row-enhanced" key={i}>
              <div className="comparison-feature-enhanced">{feature}</div>
              <div className="comparison-col-enhanced">{free}</div>
              <div className="comparison-col-enhanced highlight">{club}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ПСИХОЛОГИЯ УДЕРЖАНИЯ */}
      <div className="club-retention-section">
        <div className="section-heading center">
          <span className="eyebrow">Почему остаются</span>
          <h2>Не подписка.<br /><em>Привычка.</em></h2>
        </div>
        <div className="retention-grid">
          {[
            {
              icon: "🔥",
              title: "Стрик и достижения",
              desc: "18 достижений за прогресс. Не прерывайте серию — каждый день считается.",
            },
            {
              icon: "🎯",
              title: "Персональные рекомендации",
              desc: "На основе ваших записей AI подбирает практику именно под ваше состояние.",
            },
            {
              icon: "📈",
              title: "Видимый прогресс",
              desc: "Обзор недели показывает паттерны. Вы видите, как меняетесь.",
            },
            {
              icon: "🎁",
              title: "Новый контент каждую неделю",
              desc: "Не статичная библиотека, а живая программа. Всегда есть что открыть.",
            },
            {
              icon: "🔔",
              title: "Умные напоминания",
              desc: "Одно сообщение утром с темой дня. Без спама. Можно отключить.",
            },
            {
              icon: "💎",
              title: "Инвестиция в себя",
              desc: "Чем дольше вы с нами, тем точнее рекомендации. Данные работают на вас.",
            },
          ].map((item, i) => (
            <div className="soft-card retention-card-enhanced" key={i}>
              <span className="retention-icon">{item.icon}</span>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ЧТО ВЫ ТЕРЯЕТЕ ПРИ ОТМЕНЕ */}
      <div className="club-loss-section">
        <div className="soft-card loss-card">
          <h3>Если вы уйдёте...</h3>
          <div className="loss-list">
            <div className="loss-item">
              <span className="loss-icon">🔥</span>
              <div>
                <strong>Потеряете стрик</strong>
                <small>Ваша серия записей обнулится</small>
              </div>
            </div>
            <div className="loss-item">
              <span className="loss-icon">📊</span>
              <div>
                <strong>Потеряете инсайты</strong>
                <small>Персональные рекомендации на основе ваших записей</small>
              </div>
            </div>
            <div className="loss-item">
              <span className="loss-icon">🎁</span>
              <div>
                <strong>Пропустите контент</strong>
                <small>Новые материалы каждую неделю</small>
              </div>
            </div>
            <div className="loss-item">
              <span className="loss-icon">🏆</span>
              <div>
                <strong>Потеряете достижения</strong>
                <small>Ваш прогресс и уровень</small>
              </div>
            </div>
          </div>
          <p className="loss-note">
            Дневник, карта чисел и первый день практик останутся с вами навсегда.
          </p>
        </div>
      </div>

      {/* ОТЗЫВЫ */}
      <div className="club-testimonials-enhanced">
        <div className="section-heading center">
          <span className="eyebrow">Истории участников</span>
          <h2>Что изменилось<br /><em>за месяц.</em></h2>
        </div>
        <div className="testimonials-enhanced-grid">
          {[
            {
              text: "Я не верила в приложения для саморефлексии. Но здесь каждую неделю что-то новое. За 2 месяца я впервые увидела паттерн в своих отношениях — и это изменило всё.",
              name: "Анна, 34",
              role: "дизайнер",
              streak: "47 дней",
              achievement: "Мастер",
            },
            {
              text: "Медитации по утрам + дневник по вечерам. Это заняло 10 минут в день, но через месяц я стал спокойнее реагировать на стресс на работе.",
              name: "Дмитрий, 29",
              role: "разработчик",
              streak: "62 дня",
              achievement: "Мудрец",
            },
            {
              text: "Практика границ изменила мои отношения с мамой. Впервые за 30 лет я сказала 'нет' без вины. Это стоило больше, чем год терапии.",
              name: "Мария, 31",
              role: "менеджер",
              streak: "38 дней",
              achievement: "Практик",
            },
          ].map((t, i) => (
            <article className="soft-card testimonial-enhanced" key={i}>
              <div className="testimonial-enhanced-header">
                <div className="testimonial-enhanced-avatar">{t.name[0]}</div>
                <div>
                  <strong>{t.name}</strong>
                  <small>{t.role}</small>
                </div>
                <div className="testimonial-enhanced-stats">
                  <span>🔥 {t.streak}</span>
                  <span>🏆 {t.achievement}</span>
                </div>
              </div>
              <blockquote>«{t.text}»</blockquote>
            </article>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="club-final-cta-enhanced">
        <div className="soft-card club-cta-card-enhanced">
          <h2>7 дней бесплатно.<br /><em>Потом {pricing.monthly} {pricing.currency}/мес.</em></h2>
          <p>
            Без карты. Без автосписаний. Если не понравится — просто не продлевайте.
            Дневник, карта и первый день практик останутся с вами навсегда.
          </p>
          <div className="club-cta-options">
            <Link className="primary-button cta-primary cta-large" to="/checkout?product=club&plan=monthly">
              {pricing.monthly} {pricing.currency}/месяц
            </Link>
            <Link className="secondary-button" to="/checkout?product=club&plan=quarterly">
              {pricing.quarterly} {pricing.currency}/квартал <small>(-16%)</small>
            </Link>
            <Link className="secondary-button" to="/checkout?product=club&plan=yearly">
              {pricing.yearly} {pricing.currency}/год <small>(-33%)</small>
            </Link>
          </div>
          <p className="club-guarantee">
            🛡 Возврат в течение 14 дней без вопросов
          </p>
        </div>
      </div>
    </section>
  );
}
