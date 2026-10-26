import { Link, NavLink } from "react-router-dom";
import { useLoad } from "../hooks";
import { api } from "../api";

export default function Header() {
  const me = useLoad(api.me);
  const isRegistered = me.data?.registered;

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
        <NavLink to="/numbers">Карта</NavLink>
        <NavLink to="/practices">Практики</NavLink>
        <NavLink to="/journal">Дневник</NavLink>
        <NavLink to="/club">Клуб</NavLink>
        <NavLink to="/faq">Вопросы</NavLink>
      </nav>
      <div className="header-actions">
        {isRegistered ? (
          <Link className="ghost-button" to="/dashboard">
            Мой кабинет →
          </Link>
        ) : (
          <>
            <Link className="secondary-button header-secondary" to="/account">
              Войти
            </Link>
            <Link className="primary-button cta-primary" to="/quiz">
              Начать бесплатно
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
