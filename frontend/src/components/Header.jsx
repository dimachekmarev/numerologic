import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Numerologic home">
        <span className="brand-mark">N</span>
        <span>Numerologic</span>
      </Link>
      <nav className="desktop-nav" aria-label="Основная навигация">
        <NavLink to="/products">Продукты</NavLink>
        <NavLink to="/club">Клуб</NavLink>
        <NavLink to="/compatibility">Совместимость</NavLink>
        <NavLink to="/faq">FAQ</NavLink>
      </nav>
      <Link className="ghost-button" to="/quiz">Мини-разбор</Link>
    </header>
  )
}
