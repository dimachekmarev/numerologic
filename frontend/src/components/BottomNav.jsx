import { NavLink } from 'react-router-dom'

const items = [
  ['/', 'Дом'],
  ['/products', 'Каталог'],
  ['/dashboard', 'Кабинет'],
  ['/club', 'Клуб'],
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Быстрая навигация">
      {items.map(([to, label]) => (
        <NavLink key={to} to={to} end={to === '/'}>
          <span className="dot" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
