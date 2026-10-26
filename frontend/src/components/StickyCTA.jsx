import { Link } from "react-router-dom";

export default function StickyCTA({
  to = "/quiz",
  children = "Пройти мини-разбор",
}) {
  return (
    <div className="sticky-cta-bar">
      <div className="sticky-cta-inner">
        <div className="sticky-cta-text">
          <strong>Сохраните результаты</strong>
          <span>Создайте аккаунт — бесплатно, без карты</span>
        </div>
        <Link className="primary-button cta-primary" to={to}>
          {children} →
        </Link>
      </div>
    </div>
  );
}
