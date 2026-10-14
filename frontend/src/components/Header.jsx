import BrandMark from "./BrandMark";
import LanguageSwitch from "./LanguageSwitch";
import { useI18n } from "../i18n";
import { Link, NavLink, useLocation } from "react-router-dom";
export default function Header() {
  const { language } = useI18n();
  const en = language === "en",
    home = ["/", "/landing-a", "/landing-b"].includes(useLocation().pathname);
  const links = home
    ? [
        ["/numbers", "Личная карта", "Your chart"],
        ["/practices", "Практики", "Practices"],
        ["/journal", "Дневник", "Journal"],
      ]
    : [
        ["/today", "Сегодня", "Today"],
        ["/numbers", "Моя карта", "My chart"],
        ["/practices", "Практики", "Practices"],
        ["/journal", "Дневник", "Journal"],
        ["/goals", "Шаги", "Steps"],
      ];
  return (
    <header className="site-header">
      <Link
        to="/"
        className="brand"
        aria-label={en ? "Numerologic home" : "Numerologic — главная"}
      >
        <BrandMark decorative />
        <span>
          numerologic
          <span className="brand-caption">
            {en ? "a little closer to yourself" : "немного ближе к себе"}
          </span>
        </span>
      </Link>
      <nav
        className="desktop-nav"
        aria-label={en ? "Main navigation" : "Основная навигация"}
      >
        {links.map(([to, ru, english]) => (
          <NavLink key={to} to={to}>
            {en ? english : ru}
          </NavLink>
        ))}
        {!home && (
          <details className="header-more">
            <summary>{en ? "More" : "Ещё"}</summary>
            <nav>
              {[
                ["/calendar", "Календарь", "Calendar"],
                ["/rituals", "Ритуалы", "Rituals"],
                ["/weekly", "Моя неделя", "My week"],
                ["/compatibility", "Отношения", "Relationships"],
                ["/assistant", "Помощник", "Assistant"],
                ["/products", "Материалы", "Materials"],
                ["/club", "Клуб", "Club"],
              ].map(([to, ru, english]) => (
                <Link key={to} to={to}>
                  {en ? english : ru}
                </Link>
              ))}
            </nav>
          </details>
        )}
      </nav>
      <LanguageSwitch />
      <Link className="header-account" to="/dashboard">
        {en ? "My space" : "Мой уголок"}
        <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}
