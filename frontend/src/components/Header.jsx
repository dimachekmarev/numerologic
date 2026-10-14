import BrandMark from "./BrandMark";
import LanguageSwitch from "./LanguageSwitch";
import { useI18n } from "../i18n";
import { Link, NavLink } from "react-router-dom";
export default function Header() {
  const { t: tr } = useI18n();
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label={tr("Numerologic — главная")}>
        <BrandMark decorative />
        <span>
          numerologic<span className="brand-caption">your inner space</span>
        </span>
      </Link>
      <nav className="desktop-nav" aria-label={tr("Основная навигация")}>
        <NavLink to="/today">
          {tr("\u0421\u0435\u0433\u043E\u0434\u043D\u044F")}
        </NavLink>
        <NavLink to="/numbers">{tr("\u041A\u0430\u0440\u0442\u0430")}</NavLink>
        <NavLink to="/practices">
          {tr("\u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0438")}
        </NavLink>
        <NavLink to="/journal">
          {tr("\u0414\u043D\u0435\u0432\u043D\u0438\u043A")}
        </NavLink>
        <NavLink to="/calendar">
          {tr("\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C")}
        </NavLink>
        <NavLink to="/rituals">{tr("Ритуалы")}</NavLink>
        <NavLink to="/goals">{tr("\u0426\u0435\u043B\u0438")}</NavLink>
        <NavLink to="/assistant">
          {tr("\u041F\u043E\u043C\u043E\u0449\u043D\u0438\u043A")}
        </NavLink>
      </nav>
      <LanguageSwitch />
      <Link className="ghost-button" to="/dashboard">
        {tr(
          "\u041C\u043E\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442 \u2197",
        )}
      </Link>
    </header>
  );
}
