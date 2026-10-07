import { Link, NavLink } from "react-router-dom";
export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Numerologic — главная">
        <span className="brand-mark">
          N<span>✦</span>
        </span>
        <span>
          numerologic<span className="brand-caption">your inner space</span>
        </span>
      </Link>
      <nav className="desktop-nav" aria-label="Основная навигация">
        <NavLink to="/today">Сегодня</NavLink>
        <NavLink to="/practices">Практики</NavLink>
        <NavLink to="/journal">Дневник</NavLink>
        <NavLink to="/calendar">Календарь</NavLink>
        <NavLink to="/goals">Цели</NavLink>
        <NavLink to="/assistant">AI</NavLink>
      </nav>
      <Link className="ghost-button" to="/dashboard">
        Мой кабинет ↗
      </Link>
    </header>
  );
}
