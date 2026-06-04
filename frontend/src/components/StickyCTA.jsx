import { Link } from 'react-router-dom'

export default function StickyCTA({ to = '/quiz', children = 'Пройти мини-разбор' }) {
  return (
    <div className="sticky-cta">
      <Link className="primary-button" to={to}>{children}</Link>
    </div>
  )
}
