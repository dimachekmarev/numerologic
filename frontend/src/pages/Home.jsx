import { useI18n } from "../i18n";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
export default function Home() {
  const { t: tr } = useI18n();
  return (
    <>
      <section className="hero section-grid">
        <div className="hero-copy">
          <span className="eyebrow">
            {tr(
              "\u041F\u044F\u0442\u044C \u043C\u0438\u043D\u0443\u0442 \u0434\u043B\u044F \u0441\u0435\u0431\u044F",
            )}
          </span>
          <h1>
            {tr(
              "\u041C\u0435\u043D\u044C\u0448\u0435 \u0448\u0443\u043C\u0430.",
            )}
            <br />
            <em>
              {tr(
                "\u0411\u043E\u043B\u044C\u0448\u0435 \u0441\u0435\u0431\u044F.",
              )}
            </em>
          </h1>
          <p>
            {tr(
              "\u0412\u0430\u0448\u0435 \u043B\u0438\u0447\u043D\u043E\u0435 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E \u0434\u043B\u044F \u043C\u044B\u0441\u043B\u0435\u0439, \u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u0439 \u0438 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0445 \u0448\u0430\u0433\u043E\u0432. \u0427\u0438\u0441\u043B\u0430 \u0438 \u0441\u0438\u043C\u0432\u043E\u043B\u044B \u0434\u0430\u044E\u0442 \u043F\u043E\u0432\u043E\u0434 \u0437\u0430\u0434\u0443\u043C\u0430\u0442\u044C\u0441\u044F. \u0414\u043D\u0435\u0432\u043D\u0438\u043A \u0438 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438 \u043F\u043E\u043C\u043E\u0433\u0430\u044E\u0442 \u043F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044E.",
            )}
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/quiz">
              {tr(
                "\u041D\u0430\u0439\u0442\u0438 \u0441\u0432\u043E\u0439 \u043F\u0435\u0440\u0432\u044B\u0439 \u0448\u0430\u0433",
              )}
              <span>↗</span>
            </Link>
            <Link className="secondary-button" to="/today">
              {tr(
                "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E",
              )}
            </Link>
          </div>
          <p className="small-note">
            {tr(
              "\u041F\u0435\u0440\u0432\u044B\u0439 \u0440\u0430\u0437\u0431\u043E\u0440, \u0434\u043D\u0435\u0432\u043D\u0438\u043A \u0438 \u0442\u0435\u043C\u0430 \u0434\u043D\u044F \u2014 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E.",
            )}
          </p>
        </div>
        <div
          className="hero-art"
          aria-label={tr("Персональная карта и ежедневные практики")}
        >
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="orbit orbit-c" />
          <div className="celestial-core">
            N<span>YOUR INNER SPACE</span>
          </div>
          <div className="floating-note note-a">
            <span>
              {tr("\u2726 \u0422\u0435\u043C\u0430 \u0434\u043D\u044F")}
            </span>
            <strong>
              {tr(
                "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0441\u0435\u0431\u0435",
              )}
            </strong>
            <small>
              {tr(
                "\u041E\u0434\u043D\u0430 \u043C\u044B\u0441\u043B\u044C. \u041E\u0434\u0438\u043D \u0448\u0430\u0433.",
              )}
            </small>
          </div>
          <div className="floating-note note-b">
            <span>
              {tr(
                "\u0412\u0430\u0448 \u0434\u043D\u0435\u0432\u043D\u0438\u043A",
              )}
            </span>
            <strong>
              {tr(
                "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u0441\u0442\u0430\u043B\u043E \u044F\u0441\u043D\u0435\u0435.",
              )}
            </strong>
            <small>
              {tr(
                "\u0417\u0430\u043C\u0435\u0447\u0430\u0439\u0442\u0435 \u0441\u0432\u043E\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441.",
              )}
            </small>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">
            {tr(
              "\u041E\u0434\u0438\u043D \u0440\u0438\u0442\u0443\u0430\u043B, \u0440\u0430\u0437\u043D\u044B\u0435 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B",
            )}
          </span>
          <h2>
            {tr(
              "\u041D\u0435 \u0438\u0441\u043A\u0430\u0442\u044C \u043E\u0442\u0432\u0435\u0442 \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u043E.",
            )}
            <br />
            {tr(
              "\u041D\u0430\u0447\u0430\u0442\u044C \u0441 \u043E\u0434\u043D\u043E\u0433\u043E \u0432\u043E\u043F\u0440\u043E\u0441\u0430.",
            )}
          </h2>
        </div>
        <div className="dashboard-grid">
          {tr(
            [
              [
                "01",
                "Понять себя",
                "Нумерологическая карта с открытым расчётом. Таро как вопрос для размышления. Астрологические темы без обещаний будущего.",
              ],
              [
                "02",
                "Услышать себя",
                "Записи настроения, дневник и обзор недели. Можно вернуться к мыслям и заметить, что изменилось.",
              ],
              [
                "03",
                "Поддержать себя",
                "Практики для границ, ясности и диалога. Цели, календарь и отметки маленьких действий.",
              ],
            ].map(([n, t, p]) => (
              <article className="soft-card feature-card" key={n}>
                <span className="step-index">{tr(n)}</span>
                <h3>{tr(t)}</h3>
                <p>{tr(p)}</p>
              </article>
            )),
          )}
        </div>
      </section>
      <section className="section">
        <div className="section-heading split">
          <div>
            <span className="eyebrow">
              {tr(
                "\u0414\u043B\u044F \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0430",
              )}
            </span>
            <h2>
              {tr(
                "\u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0443\u043C\u044B, \u043A \u043A\u043E\u0442\u043E\u0440\u044B\u043C",
              )}
              <br />
              {tr(
                "\u0445\u043E\u0447\u0435\u0442\u0441\u044F \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0442\u044C\u0441\u044F.",
              )}
            </h2>
          </div>
          <Link className="ghost-button" to="/practices">
            {tr(
              "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438 \u2197",
            )}
          </Link>
        </div>
        <div className="product-grid">
          {tr(
            products
              .filter((x) => x.category === "practice")
              .slice(0, 3)
              .map((p) => <ProductCard key={p.slug} product={p} />),
          )}
        </div>
      </section>
      <section className="club-banner">
        <span className="eyebrow">Numerologic Club</span>
        <h2>
          {tr(
            "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0432 \u0432\u0430\u0448\u0435\u043C \u0442\u0435\u043C\u043F\u0435.",
          )}
        </h2>
        <p>
          {tr(
            "\u0412\u0441\u0435 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0443\u043C\u044B, \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u0438 \u043E\u0431\u0437\u043E\u0440 \u043D\u0435\u0434\u0435\u043B\u0438 \u2014 \u0432 \u043E\u0434\u043D\u043E\u043C \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0435. 1 000 \u20BD \u0437\u0430 30 \u0434\u043D\u0435\u0439. \u041F\u0440\u043E\u0434\u043B\u0435\u043D\u0438\u0435 \u043F\u043E \u0432\u0430\u0448\u0435\u043C\u0443 \u0432\u044B\u0431\u043E\u0440\u0443.",
          )}
        </p>
        <Link className="primary-button" to="/club">
          {tr(
            "\u0427\u0442\u043E \u0432\u043D\u0443\u0442\u0440\u0438 \u043A\u043B\u0443\u0431\u0430 \u2197",
          )}
        </Link>
      </section>
    </>
  );
}
