import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Compatibility() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name_a: '', birth_date_a: '', name_b: '', birth_date_b: '' })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const result = await api.compatibilityPreview(form)
      setPreview(result)
    } finally {
      setLoading(false)
    }
  }

  function buy() {
    localStorage.setItem('numerologic_checkout_product', 'compatibility')
    localStorage.setItem('numerologic_quiz', JSON.stringify({ name: form.name_a, birth_date: form.birth_date_a, focus: 'Отношения' }))
    navigate('/checkout')
  }

  return (
    <section className="section-grid compatibility-page">
      <form className="soft-card" onSubmit={submit}>
        <span className="eyebrow">Compatibility flow</span>
        <h1>Совместимость пары</h1>
        <input required placeholder="Ваше имя" value={form.name_a} onChange={(e) => setForm({ ...form, name_a: e.target.value })} />
        <input required type="date" value={form.birth_date_a} onChange={(e) => setForm({ ...form, birth_date_a: e.target.value })} />
        <input required placeholder="Имя партнёра" value={form.name_b} onChange={(e) => setForm({ ...form, name_b: e.target.value })} />
        <input required type="date" value={form.birth_date_b} onChange={(e) => setForm({ ...form, birth_date_b: e.target.value })} />
        <button className="primary-button" disabled={loading}>{loading ? 'Считаю...' : 'Показать preview'}</button>
      </form>
      <div className="soft-card locked-card">
        {preview ? (
          <>
            <span className="chip">Preview</span>
            <h2>{preview.summary}</h2>
            <ul className="feature-list large">
              {preview.locked.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <button className="primary-button" onClick={buy}>Разблокировать полный разбор</button>
          </>
        ) : (
          <>
            <h2>Заполните данные пары</h2>
            <p>Backend вернёт preview и recommended product для mock checkout.</p>
          </>
        )}
      </div>
    </section>
  )
}
