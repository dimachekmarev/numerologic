import { useI18n } from "../i18n";
import { NavLink } from "react-router-dom";
import GentleIcon from "./GentleIcon";
const items = [
  ["/today", "sun", "Сегодня", "Today"],
  ["/practices", "flower", "Практики", "Practices"],
  ["/journal", "journal", "Дневник", "Journal"],
  ["/goals", "leaf", "Шаги", "Steps"],
  ["/dashboard", "heart", "Мой уголок", "My space"],
];
export default function BottomNav() {
  const { language } = useI18n(),
    en = language === "en";
  return (
    <nav
      className="bottom-nav"
      aria-label={en ? "Space navigation" : "Навигация пространства"}
    >
      {items.map(([to, icon, ru, english]) => (
        <NavLink key={to} to={to}>
          <GentleIcon name={icon} size={22} />
          {en ? english : ru}
        </NavLink>
      ))}
    </nav>
  );
}
