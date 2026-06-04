import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { reportBlocks } from '../data/reportTemplates'

export default function Report() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.report(id)
      .then((data) => {
        setReport(data)
        const reports = JSON.parse(localStorage.getItem('numerologic_reports') || '[]')
        if (!reports.some((item) => item.id === data.id)) {
          localStorage.setItem('numerologic_reports', JSON.stringify([data, ...reports].slice(0, 12)))
        }
      })
      .catch((err) => setError(err.message))
  }, [id])

  if (error) {
    return <section className="narrow-page empty-state"><h1>Отчёт не найден</h1><p>{error}</p><Link to="/products">Выбрать продукт</Link></section>
  }
  if (!report) return <section className="narrow-page empty-state"><h1>Загружаем report...</h1></section>

  return (
    <section className="report-page narrow-page">
      <article className="soft-card report-document">
        <span className="chip sage">Полный report</span>
        <h1>{report.title}</h1>
        <div className="report-blocks">
          {reportBlocks.map((block) => <span key={block}>{block}</span>)}
        </div>
        <pre>{report.content}</pre>
      </article>
    </section>
  )
}
