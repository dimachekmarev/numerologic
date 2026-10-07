import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
export default function Home() {
  return (
    <>
      <section className="hero section-grid">
        <div className="hero-copy">
          <span className="eyebrow">Пять минут для себя</span>
          <h1>
            Меньше шума.
            <br />
            <em>Больше себя.</em>
          </h1>
          <p>
            Ваше личное пространство для мыслей, отношений и маленьких шагов.
            Числа и символы дают повод задуматься. Дневник и практики помогают
            перейти к действию.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/quiz">
              Найти свой первый шаг <span>↗</span>
            </Link>
            <Link className="secondary-button" to="/today">
              Открыть пространство
            </Link>
          </div>
          <p className="small-note">
            Первый разбор, дневник и тема дня — бесплатно.
          </p>
        </div>
        <div
          className="hero-art"
          aria-label="Персональная карта и ежедневные практики"
        >
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
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Один ритуал, разные инструменты</span>
          <h2>
            Не искать ответ бесконечно.
            <br />
            Начать с одного вопроса.
          </h2>
        </div>
        <div className="dashboard-grid">
          {[
            [
              "01",
              "Понять себя",
              "Нумерологическая карта с открытым расчётом. Таро как вопрос для размышления. Астрологические темы без обещаний будущего.",
            ],
            [
              "02",
              "Услышать себя",
              "Записи настроения, дневник, AI-помощник с контекстом. Можно вернуться к мыслям и заметить, что изменилось.",
            ],
            [
              "03",
              "Поддержать себя",
              "Практики для границ, ясности и диалога. Цели, календарь и отметки маленьких действий.",
            ],
          ].map(([n, t, p]) => (
            <article className="soft-card feature-card" key={n}>
              <span className="step-index">{n}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-heading split">
          <div>
            <span className="eyebrow">Для конкретного запроса</span>
            <h2>
              Практикумы, к которым
              <br />
              хочется возвращаться.
            </h2>
          </div>
          <Link className="ghost-button" to="/practices">
            Посмотреть практики ↗
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x.category === "practice")
            .slice(0, 3)
            .map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
        </div>
      </section>
      <section className="club-banner">
        <span className="eyebrow">Numerologic Club</span>
        <h2>Поддержка в вашем темпе.</h2>
        <p>
          Все практикумы, обзор недели и AI-помощник — в одном пространстве. 1
          000 ₽ за 30 дней. Продление по вашему выбору.
        </p>
        <Link className="primary-button" to="/club">
          Что внутри клуба ↗
        </Link>
      </section>
    </>
  );
}
