import { useI18n } from "../i18n";
import { NavLink } from "react-router-dom";
const items = [
  ["/today", "☀", "Сегодня"],
  ["/practices", "✦", "Практики"],
  ["/journal", "✎", "Дневник"],
  ["/goals", "◎", "Шаги"],
  ["/dashboard", "◉", "Кабинет"],
];
export default function BottomNav() {
  const { t: tr } = useI18n();
  return (
    <nav className="bottom-nav" aria-label={tr("Навигация пространства")}>
      {tr(
        items.map(([to, icon, label]) => (
          <NavLink key={to} to={to}>
            <span aria-hidden="true">{tr(icon)}</span>
            {tr(label)}
          </NavLink>
        )),
      )}
    </nav>
  );
}
