import { NavLink } from "react-router-dom";
const items = [
  ["/today", "☀", "Сегодня"],
  ["/practices", "✦", "Практики"],
  ["/journal", "✎", "Дневник"],
  ["/goals", "◎", "Шаги"],
  ["/dashboard", "◉", "Кабинет"],
];
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Навигация пространства">
      {items.map(([to, icon, label]) => (
        <NavLink key={to} to={to}>
          <span aria-hidden="true">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
