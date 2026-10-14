import { useI18n } from "../i18n";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api";
import { useLoad } from "../hooks";
import Status from "../components/Status";
import TrialAccess from "../components/TrialAccess";
import { formatPrice } from "../data/products";
export function Practice() {
  const { t: tr } = useI18n();
  const { slug } = useParams(),
    state = useLoad(() => api.practice(slug), [slug]),
    [error, setError] = useState("");
  const [optimistic, setOptimistic] = useState({});
  const [busyIndex, setBusyIndex] = useState(null);
  useEffect(() => {
    api.track("practice_preview", {
      product: slug,
    });
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
    setOptimistic((values) => ({
      ...values,
      [key]: done,
    }));
    setBusyIndex(index);
    try {
      await api.mark({
        slug,
        index,
        done,
      });
      if (done)
        void api.track("practice_completed", {
          product: slug,
          source: "practice",
        });
      setOptimistic({});
      state.reload();
    } catch (e) {
      setOptimistic((values) => {
        const next = {
          ...values,
        };
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
        <Link to="/practices">
          {tr(
            "\u2190 \u0412\u0441\u0435 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438",
          )}
        </Link>
        <span className="eyebrow">
          {tr(p.total)}
          {tr(
            "\u0434\u043D\u0435\u0439 \xB7 \u0432 \u0432\u0430\u0448\u0435\u043C \u0442\u0435\u043C\u043F\u0435",
          )}
        </span>
        <h1>{tr(p.title)}</h1>
        <p>{tr(p.subtitle)}</p>
      </div>
      {tr(error && <p role="alert">{tr(error)}</p>)}
      {tr(!p.unlocked && <TrialAccess onChanged={state.reload} />)}
      <div className="practice-list">
        {tr(
          p.days.map((d, i) => (
            <article className="soft-card practice-day" key={d.index}>
              <span className="chip">
                {tr("\u0414\u0435\u043D\u044C")}
                {tr(d.index + 1)}
              </span>
              <h2>{tr(d.title)}</h2>
              <p>{tr(d.exercise)}</p>
              <p className="reflection-question">
                {tr("\u0412 \u0434\u043D\u0435\u0432\u043D\u0438\u043A:")}
                {tr(d.question)}
              </p>
              {tr(
                (p.unlocked || d.index === 0) && (
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
                    {tr(
                      "\u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430",
                    )}
                  </label>
                ),
              )}
              <Link className="ghost-button" to="/journal">
                {tr(
                  "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u043C\u044B\u0441\u043B\u0438 \u2197",
                )}
              </Link>
              {tr(
                i === 0 && !p.unlocked && (
                  <div className="unlock">
                    <p>
                      {tr(
                        "\u041F\u0435\u0440\u0432\u044B\u0439 \u0434\u0435\u043D\u044C \u043E\u0442\u043A\u0440\u044B\u0442 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E. \u0412\u0441\u0435",
                      )}
                      {tr(p.total)}
                      {tr(
                        "\u0434\u043D\u0435\u0439 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E \u0437\u0430",
                      )}
                      {tr(formatPrice(p.price))}
                      {tr(
                        "\u0438\u043B\u0438 \u0432 \u043A\u043B\u0443\u0431\u0435.",
                      )}
                    </p>
                    <div className="hero-actions">
                      <Link
                        className="primary-button"
                        to={`/checkout?product=${slug}`}
                      >
                        {tr(
                          "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0443\u043C",
                        )}
                      </Link>
                      <Link className="secondary-button" to="/club">
                        {tr(
                          "\u0412\u0441\u0435 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438 \u0432 \u043A\u043B\u0443\u0431\u0435",
                        )}
                      </Link>
                    </div>
                  </div>
                ),
              )}
            </article>
          )),
        )}
      </div>
    </section>
  );
}
export default function Practices() {
  const { t: tr } = useI18n();
  const state = useLoad(api.practices);
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">
          {tr(
            "\u041E\u0442 \u043C\u044B\u0441\u043B\u0438 \u043A \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044E",
          )}
        </span>
        <h1>
          {tr(
            "\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438.",
          )}
          <br />
          {tr(
            "\u0417\u0430\u043C\u0435\u0442\u043D\u044B\u0435 \u0448\u0430\u0433\u0438.",
          )}
        </h1>
        <p>
          {tr(
            "\u0421\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u044F\u0441\u043D\u043E\u0441\u0442\u0438, \u0433\u0440\u0430\u043D\u0438\u0446 \u0438 \u0434\u0438\u0430\u043B\u043E\u0433\u0430. \u041F\u0435\u0440\u0432\u044B\u0439 \u0434\u0435\u043D\u044C \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0443\u043C\u0430 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0439.",
          )}
        </p>
      </div>
      <Status {...state} />
      <TrialAccess onChanged={state.reload} />
      <div className="product-grid">
        {tr(
          state.data?.map((p) => (
            <article className="soft-card feature-card" key={p.slug}>
              <span className="chip">
                {tr(p.total)}
                {tr("\u0434\u043D\u0435\u0439")}
                {tr(" ")}
                {tr(p.unlocked ? "· открыт" : "· первый день бесплатно")}
              </span>
              <h2>{tr(p.title)}</h2>
              <p>{tr(p.subtitle)}</p>
              <p>
                {tr(
                  p.unlocked
                    ? `${p.progress} из ${p.total} отмечено`
                    : formatPrice(p.price),
                )}
              </p>
              <Link className="primary-button" to={`/practices/${p.slug}`}>
                {tr(p.unlocked ? "Продолжить" : "Попробовать практику")} ↗
              </Link>
            </article>
          )),
        )}
      </div>
    </section>
  );
}
