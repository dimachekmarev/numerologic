import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import SocialProof from "../components/SocialProof";
import Testimonials from "../components/Testimonials";
import GuaranteeBadge from "../components/GuaranteeBadge";
import InlineFaq from "../components/InlineFaq";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero section-grid">
        <div className="hero-copy">
          <span className="eyebrow">5 минут для себя · без регистрации</span>
          <h1>
            Меньше шума.
            <br />
            <em>Больше ясности.</em>
          </h1>
          <p className="hero-lead">
            Персональное пространство, где числа дают повод задуматься, 
            дневник помогает услышать себя, а практики — перейти к действию. 
            Не марафон продуктивности. Один осмысленный шаг в день.
          </p>
          <div className="hero-actions">
            <Link className="primary-button cta-primary" to="/quiz">
              <span className="cta-icon">✦</span>
              Найти свой первый шаг
              <span className="cta-arrow">→</span>
            </Link>
            <Link className="secondary-button" to="/today">
              Тема дня — бесплатно
            </Link>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              <span className="avatar-dot" style={{ background: "#8d6a95" }} />
              <span className="avatar-dot" style={{ background: "#a88db8" }} />
              <span className="avatar-dot" style={{ background: "#c4aed1" }} />
              <span className="avatar-dot" style={{ background: "#d4c1de" }} />
            </div>
            <span className="trust-text">
              <strong>1 200+</strong> человек уже нашли свой ритм
            </span>
          </div>
          <p className="small-note">
            Мини-разбор, карта чисел, дневник и первый день практики — бесплатно. 
            Без карты. Без автосписаний.
          </p>
        </div>
        <div className="hero-art" aria-label="Персональная карта и ежедневные практики">
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="orbit orbit-c" />
          <div className="celestial-core">
            N<span>YOUR INNER SPACE</span>
          </div>
          <div className="floating-note note-a">
            <span>✦ Тема дня</span>
            <strong>Вернуться к себе</strong>
            <small>Одна мысль. Один шаг.</small>
          </div>
          <div className="floating-note note-b">
            <span>Ваш дневник</span>
            <strong>Сегодня стало яснее.</strong>
            <small>Замечайте свой прогресс.</small>
          </div>
          <div className="floating-note note-c">
            <span>⚡ Практика</span>
            <strong>3 минуты тишины</strong>
            <small>Границы без вины.</small>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <SocialProof />

      {/* PAIN POINTS → SOLUTION */}
      <section className="section pain-section">
        <div className="section-heading center">
          <span className="eyebrow">Знакомо?</span>
          <h2>
            Двадцать задач в голове,<br />
            <em>а начать не с чего.</em>
          </h2>
          <p className="section-subtitle">
            Вы не одни. Большинство приходят сюда с одним из этих состояний — 
            и уходят с конкретным шагом.
          </p>
        </div>
        <div className="pain-grid">
          {[
            {
              pain: "Сказала «да», а потом злишься на себя",
              solution: "Практика границ: один короткий отказ без оправданий",
              icon: "🛡",
              link: "/practices/boundaries",
              label: "Границы",
            },
            {
              pain: "В голове шум, не могу выбрать приоритет",
              solution: "Упражнение ясности: выгрузить мысли за 5 минут",
              icon: "🧠",
              link: "/practices/clarity",
              label: "Ясность",
            },
            {
              pain: "Разговор снова превратился в спор",
              solution: "Карточки диалога: три минуты настоящего слушания",
              icon: "💬",
              link: "/practices/relationship-dialogue",
              label: "Диалог",
            },
            {
              pain: "Новый марафон? Нет, нужен один посильный шаг",
              solution: "Мягкий фокус: 14 дней маленьких действий с трекером",
              icon: "🎯",
              link: "/practices/gentle-focus",
              label: "Фокус",
            },
          ].map((item) => (
            <Link to={item.link} className="pain-card soft-card" key={item.label}>
              <span className="pain-icon">{item.icon}</span>
              <span className="chip">{item.label}</span>
              <h3 className="pain-question">«{item.pain}»</h3>
              <div className="pain-arrow">
                <p>{item.solution}</p>
                <span>Попробовать первый день →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-heading center">
          <span className="eyebrow">Как это работает</span>
          <h2>
            Три шага от хаоса<br />
            <em>к одному ясному действию.</em>
          </h2>
        </div>
        <div className="steps-flow">
          {[
            {
              step: "01",
              title: "Узнайте свой ритм",
              desc: "Мини-разбор за 5 минут: дата рождения, фокус запроса — и вы видите числа своего периода. Прозрачная арифметика, без мистики.",
              icon: "✦",
              link: "/quiz",
            },
            {
              step: "02",
              title: "Запишите, что чувствуете",
              desc: "Дневник с настроением, цели на неделю, календарь. Через 7 дней — автоматический обзор: что помогало, что повторялось.",
              icon: "📝",
              link: "/journal",
            },
            {
              step: "03",
              title: "Сделайте один шаг",
              desc: "Практика на 3 минуты: границы, ясность, диалог или фокус. Отметьте выполнение. Завтра — следующий маленький шаг.",
              icon: "→",
              link: "/practices",
            },
          ].map((item, i) => (
            <Link to={item.link} className="step-card soft-card" key={item.step}>
              <div className="step-number">{item.step}</div>
              <div className="step-icon-wrap">
                <span className="step-icon">{item.icon}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="step-cta">Начать →</span>
              {i < 2 && <div className="step-connector" />}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES DEEP DIVE */}
      <section className="section features-deep">
        <div className="section-heading center">
          <span className="eyebrow">Один ритуал — разные инструменты</span>
          <h2>
            Не бесконечно искать ответ.<br />
            <em>Начать с одного вопроса.</em>
          </h2>
        </div>
        <div className="features-bento">
          <Link to="/numbers" className="bento-card bento-large tint-lavender">
            <span className="chip">Карта чисел</span>
            <div className="bento-number">7</div>
            <h3>Ваш жизненный путь</h3>
            <p>
              Нумерологическая карта с открытым расчётом. Числа 11/22/33 сохраняются.
              Путь, имя, месяц — и что это значит для вашего периода.
            </p>
            <span className="bento-cta">Построить карту бесплатно →</span>
          </Link>
          <Link to="/today" className="bento-card tint-sage">
            <span className="chip">Тема дня</span>
            <h3>Одна мысль на сегодня</h3>
            <p>Число дня, карта таро как вопрос для размышления, астрологическая тема.</p>
            <span className="bento-cta">Открыть →</span>
          </Link>
          <Link to="/journal" className="bento-card tint-rose">
            <span className="chip">Дневник</span>
            <h3>Услышать себя</h3>
            <p>Настроение, записи, поиск. Через неделю — обзор: что помогало.</p>
            <span className="bento-cta">Начать запись →</span>
          </Link>
          <Link to="/practices" className="bento-card bento-wide">
            <span className="chip">Практики</span>
            <div className="bento-practices">
              {["Границы", "Ясность", "Диалог", "Фокус"].map((t) => (
                <span className="practice-pill" key={t}>{t}</span>
              ))}
            </div>
            <h3>4 практикума · первый день бесплатно</h3>
            <p>
              Пошаговые упражнения с отметками прогресса и вопросами для дневника. 
              Не теория — действие за 3 минуты.
            </p>
            <span className="bento-cta">Выбрать практику →</span>
          </Link>
          <Link to="/assistant" className="bento-card tint-lavender">
            <span className="chip">AI-помощник</span>
            <h3>Разговор с контекстом</h3>
            <p>Помнит ваш профиль и последние записи. До 10 сообщений в день.</p>
            <span className="bento-cta">Спросить →</span>
          </Link>
          <Link to="/weekly" className="bento-card tint-sage">
            <span className="chip">Обзор недели</span>
            <h3>Замечайте прогресс</h3>
            <p>Настроение, шаги, цели и практики за 7 дней в одной картине.</p>
            <span className="bento-cta">Моя неделя →</span>
          </Link>
        </div>
      </section>

      {/* PRACTICES SHOWCASE */}
      <section className="section">
        <div className="section-heading split">
          <div>
            <span className="eyebrow">От мысли к действию</span>
            <h2>
              Практикумы, к которым<br />
              <em>хочется возвращаться.</em>
            </h2>
            <p>Первый день каждого — бесплатно. Без регистрации.</p>
          </div>
          <Link className="ghost-button" to="/practices">
            Все практики ↗
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x.category === "practice")
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* PRICING COMPARISON */}
      <section className="section pricing-section">
        <div className="section-heading center">
          <span className="eyebrow">Честные цены</span>
          <h2>
            Начните бесплатно.<br />
            <em>Платите только за то, что помогает.</em>
          </h2>
        </div>
        <div className="pricing-table">
          <div className="pricing-header-row">
            <div className="pricing-feature-col" />
            <div className="pricing-col pricing-free">
              <span className="chip">Бесплатно</span>
              <h3>Пространство</h3>
              <div className="pricing-amount">0 ₽</div>
              <p>Навсегда</p>
            </div>
            <div className="pricing-col pricing-trial">
              <span className="chip sage">7 дней</span>
              <h3>Пробный</h3>
              <div className="pricing-amount">0 ₽</div>
              <p>Один раз на аккаунт</p>
            </div>
            <div className="pricing-col pricing-club pricing-highlight">
              <span className="chip">Популярно</span>
              <h3>Клуб</h3>
              <div className="pricing-amount">1 000 ₽</div>
              <p>30 дней</p>
              <Link className="primary-button" to="/checkout?product=club">
                Вступить →
              </Link>
            </div>
          </div>
          <div className="pricing-features">
            {[
              ["Мини-разбор и карта чисел", true, true, true],
              ["Тема дня, дневник, цели, календарь", true, true, true],
              ["Обзор недели", true, true, true],
              ["PDF карты чисел", true, true, true],
              ["Первый день каждого практикума", true, true, true],
              ["Все практикумы полностью", false, true, true],
              ["Полные тематические отчёты", false, true, true],
              ["AI-помощник (10 сообщений/день)", false, true, true],
              ["Еженедельная рефлексия", false, false, true],
            ].map(([feature, free, trial, club]) => (
              <div className="pricing-row" key={feature}>
                <div className="pricing-feature-col">{feature}</div>
                <div className="pricing-col pricing-free">
                  {free ? <span className="check">✓</span> : <span className="cross">—</span>}
                </div>
                <div className="pricing-col pricing-trial">
                  {trial ? <span className="check">✓</span> : <span className="cross">—</span>}
                </div>
                <div className="pricing-col pricing-club">
                  {club ? <span className="check">✓</span> : <span className="cross">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="pricing-note">
          Разовые покупки (практикумы 390–790 ₽, отчёты 990–2 990 ₽) доступны 
          без подписки. Материал сохраняется навсегда. Продление клуба — только по вашему решению.
        </p>
      </section>

      {/* GUARANTEE */}
      <GuaranteeBadge />

      {/* CLUB CTA */}
      <section className="club-banner">
        <div className="club-banner-content">
          <span className="eyebrow">Numerologic Club</span>
          <h2>Все практики. Все материалы.<br /><em>Одно пространство.</em></h2>
          <p>
            1 000 ₽ за 30 дней. Без автосписаний — продлеваете только когда сами решите.
            Первые 7 дней бесплатно, чтобы попробовать всё.
          </p>
          <div className="hero-actions">
            <Link className="primary-button cta-primary" to="/checkout?product=club">
              <span className="cta-icon">✦</span>
              Попробовать 7 дней бесплатно
              <span className="cta-arrow">→</span>
            </Link>
            <Link className="secondary-button" to="/club">
              Что внутри клуба
            </Link>
          </div>
        </div>
        <div className="club-banner-art">
          <div className="club-orbit" />
          <div className="club-orbit club-orbit-b" />
          <div className="club-core">✦</div>
        </div>
      </section>

      {/* INLINE FAQ */}
      <InlineFaq />

      {/* FINAL CTA */}
      <section className="section final-cta-section">
        <div className="final-cta-card">
          <h2>Готовы уделить себе 5 минут?</h2>
          <p>
            Мини-разбор покажет числа вашего периода. Дневник поможет записать первую мысль.
            Практика — сделать один шаг. Всё бесплатно.
          </p>
          <Link className="primary-button cta-primary cta-large" to="/quiz">
            <span className="cta-icon">✦</span>
            Найти свой первый шаг
            <span className="cta-arrow">→</span>
          </Link>
          <p className="small-note">
            Без регистрации · без карты · без автосписаний
          </p>
        </div>
      </section>
    </>
  );
}
