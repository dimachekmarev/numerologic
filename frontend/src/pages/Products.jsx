import { useI18n } from "../i18n";
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
export default function Products() {
  const { t: tr } = useI18n();
  const [active, setActive] = useState("all");
  const chips = [
    ["all", "Все"],
    ["practice", "Практикумы"],
    ["personal", "Личное"],
    ["relationship", "Отношения"],
    ["forecast", "Период"],
    ["work", "Работа"],
    ["club", "Клуб"],
  ];
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">
          {tr(
            "\u0411\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0430 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432",
          )}
        </span>
        <h1>
          {tr("\u041E\u0434\u0438\u043D \u0437\u0430\u043F\u0440\u043E\u0441.")}
          <br />
          {tr(
            "\u041F\u043E\u043D\u044F\u0442\u043D\u044B\u0439 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433.",
          )}
        </h1>
        <p>
          {tr(
            "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u043E\u0432\u044B\u0439 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u0438\u043B\u0438 \u043A\u043B\u0443\u0431. \u0421\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u0438 \u0446\u0435\u043D\u0430 \u0432\u0438\u0434\u043D\u044B \u0434\u043E \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044F; PDF \u0432\u043A\u043B\u044E\u0447\u0451\u043D.",
          )}
        </p>
      </div>
      <div className="filter-row">
        {tr(
          chips.map(([key, label]) => (
            <button
              key={key}
              className={active === key ? "active" : ""}
              onClick={() => setActive(key)}
            >
              {tr(label)}
            </button>
          )),
        )}
      </div>
      <div className="product-grid">
        {tr(
          products
            .filter((p) => active === "all" || p.category === active)
            .map((p) => <ProductCard key={p.slug} product={p} />),
        )}
      </div>
    </section>
  );
}
