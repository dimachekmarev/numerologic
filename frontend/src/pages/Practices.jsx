import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
import { formatPrice } from "../data/products";
export function Practice() {
  const { slug } = useParams(),
    state = useLoad(() => api.practice(slug), [slug]),
    [error, setError] = useState("");
  const [optimistic, setOptimistic] = useState({});
  const [busyIndex, setBusyIndex] = useState(null);
  useEffect(() => {
    api.track("practice_preview", { product: slug });
  }, [slug]);
  if (!state.data)
    return (
      <section className="section">
        <Status {...state} />
      </section>
    );
  const p = state.data;
  async function mark(index, done) {
    const key = `${slug}:${index}`;
    setOptimistic((values) => ({ ...values, [key]: done }));
    setBusyIndex(index);
    try {
      await api.mark({ slug, index, done });
      state.reload();
    } catch (e) {
      setOptimistic((values) => {
        const next = { ...values };
        delete next[key];
        return next;
      });
      setError(e.message);
    } finally {
      setBusyIndex(null);
    }
  }
  return (
    <section className="section">
      <div className="section-heading">
        <Link to="/practices">← Все практики</Link>
        <span className="eyebrow">{p.total} дней · в вашем темпе</span>
        <h1>{p.title}</h1>
        <p>{p.subtitle}</p>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="practice-list">
        {p.days.map((d, i) => (
          <article className="soft-card practice-day" key={d.index}>
            <span className="chip">День {d.index + 1}</span>
            <h2>{d.title}</h2>
            <p>{d.exercise}</p>
            <p className="reflection-question">В дневник: {d.question}</p>
            {p.unlocked && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={
                    optimistic[`${slug}:${d.index}`] ??
                    p.completed.includes(d.index)
                  }
                  disabled={busyIndex === d.index}
                  onChange={(e) => mark(d.index, e.target.checked)}
                />
                Практика выполнена
              </label>
            )}
            <Link className="ghost-button" to="/journal">
              Записать мысли ↗
            </Link>
            {i === 0 && !p.unlocked && (
              <div className="unlock">
                <p>
                  Первый день открыт бесплатно. Все {p.total} дней доступны
                  отдельно за {formatPrice(p.price)} или в клубе.
                </p>
                <div className="hero-actions">
                  <Link
                    className="primary-button"
                    to={`/checkout?product=${slug}`}
                  >
                    Открыть практикум
                  </Link>
                  <Link className="secondary-button" to="/club">
                    Все практики в клубе
                  </Link>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
export default function Practices() {
  const state = useLoad(api.practices);
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">От мысли к действию</span>
        <h1>
          Маленькие практики.
          <br />
          Заметные шаги.
        </h1>
        <p>
          Самостоятельные упражнения для ясности, границ и диалога. Первый день
          каждого практикума бесплатный.
        </p>
      </div>
      <Status {...state} />
      <div className="product-grid">
        {state.data?.map((p) => (
          <article className="soft-card feature-card" key={p.slug}>
            <span className="chip">
              {p.total} дней{" "}
              {p.unlocked ? "· открыт" : "· первый день бесплатно"}
            </span>
            <h2>{p.title}</h2>
            <p>{p.subtitle}</p>
            <p>
              {p.unlocked
                ? `${p.progress} из ${p.total} отмечено`
                : formatPrice(p.price)}
            </p>
            <Link className="primary-button" to={`/practices/${p.slug}`}>
              {p.unlocked ? "Продолжить" : "Попробовать практику"} ↗
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
