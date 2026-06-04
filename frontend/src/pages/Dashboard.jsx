import { Link } from 'react-router-dom'
import ReportCard from '../components/ReportCard'

export default function Dashboard() {
  const quiz = JSON.parse(localStorage.getItem('numerologic_quiz') || 'null')
  const result = JSON.parse(localStorage.getItem('numerologic_result') || 'null')
  const reports = JSON.parse(localStorage.getItem('numerologic_reports') || '[]')
  const lastPayment = JSON.parse(localStorage.getItem('numerologic_last_payment') || 'null')

  return (
    <section className="dashboard-page section">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Ваш кабинет</h1>
          <p>Для MVP dashboard читает localStorage и сохранённые reports, созданные mock checkout.</p>
        </div>
        <Link className="primary-button" to="/quiz">Новый мини-разбор</Link>
      </div>
      <div className="dashboard-grid">
        <article className="soft-card widget">
          <span className="chip">Профиль</span>
          <h2>{quiz?.name || 'Гость Numerologic'}</h2>
          <p>{quiz?.birth_date || 'Дата рождения не указана'}</p>
          <div className="numbers-row small">
            <div><strong>{result?.profile?.life_path || '—'}</strong><span>путь</span></div>
            <div><strong>{result?.profile?.month || '—'}</strong><span>месяц</span></div>
          </div>
        </article>
        <article className="soft-card widget tint-lavender">
          <span className="chip sage">Коммерческий flow</span>
          <h2>{lastPayment ? 'Оплата прошла' : 'Оплат пока нет'}</h2>
          <p>{lastPayment ? `Order #${lastPayment.order_id}` : 'Пройдите checkout, чтобы создать report.'}</p>
          <Link className="ghost-button" to="/products">К продуктам</Link>
        </article>
        <article className="soft-card widget tint-sage">
          <span className="chip">Club</span>
          <h2>Numerologic Club</h2>
          <p>Mock-подписка доступна через страницу клуба или checkout продукта Club.</p>
          <Link className="ghost-button" to="/club">Открыть клуб</Link>
        </article>
      </div>
      <div className="section-heading">
        <h2>Reports</h2>
      </div>
      <div className="reports-grid">
        {reports.length ? reports.map((report) => <ReportCard key={report.id} report={report} />) : <p>Пока нет сохранённых отчётов. После mock-success отчёт появится здесь.</p>}
      </div>
    </section>
  )
}
