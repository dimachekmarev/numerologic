import { Link } from 'react-router-dom'

export default function ReportCard({ report }) {
  return (
    <article className="report-card">
      <span className="chip sage">Сохранённый отчёт</span>
      <h3>{report.title}</h3>
      <p>{String(report.content || '').slice(0, 140)}...</p>
      <Link className="ghost-button" to={`/report/${report.id}`}>Открыть отчёт</Link>
    </article>
  )
}
