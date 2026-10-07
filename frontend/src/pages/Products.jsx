import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
export default function Products() {
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
        <span className="eyebrow">Библиотека материалов</span>
        <h1>
          Один запрос.
          <br />
          Понятный следующий шаг.
        </h1>
        <p>
          Выберите разовый материал или клуб. Содержание и цена видны до
          оформления; PDF включён.
        </p>
      </div>
      <div className="filter-row">
        {chips.map(([key, label]) => (
          <button
            key={key}
            className={active === key ? "active" : ""}
            onClick={() => setActive(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="product-grid">
        {products
          .filter((p) => active === "all" || p.category === active)
          .map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
      </div>
    </section>
  );
}
