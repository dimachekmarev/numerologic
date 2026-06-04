import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const focusOptions = ['Ясность', 'Отношения', 'Деньги и реализация', 'Период жизни']
const relationshipOptions = ['в отношениях', 'в поиске', 'выбираю себя', 'сложно ответить']

export default function Quiz() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    birth_date: '',
    focus: 'Ясность',
    relationship_status: 'сложно ответить',
    question: '',
    email: '',
  })

  const steps = useMemo(() => [
    { title: 'Как к вам обращаться?', field: 'name', type: 'text', placeholder: 'Например, Дмитрий' },
    { title: 'Дата рождения', field: 'birth_date', type: 'date' },
    { title: 'Что хочется прояснить?', field: 'focus', options: focusOptions },
    { title: 'Контекст отношений', field: 'relationship_status', options: relationshipOptions },
    { title: 'Ваш вопрос к периоду', field: 'question', type: 'textarea', placeholder: 'Что сейчас повторяется или требует ясности?' },
  ], [])

  const current = steps[step]
  const canContinue = current.options || String(form[current.field] || '').trim().length > 0

  async function submit() {
    setLoading(true)
    try {
      const payload = { ...form, email: form.email || undefined }
      const result = await api.completeQuiz(payload)
      localStorage.setItem('numerologic_quiz', JSON.stringify(payload))
      localStorage.setItem('numerologic_result', JSON.stringify(result))
      navigate('/result')
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (step < steps.length - 1) setStep((value) => value + 1)
    else submit()
  }

  return (
    <section className="quiz-page narrow-page">
      <div className="progress-shell">
        <span>Шаг {step + 1} из {steps.length}</span>
        <div className="progress-bar"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      </div>
      <article className="quiz-card glass-card">
        <span className="eyebrow">Мини-разбор</span>
        <h1>{current.title}</h1>
        {current.options ? (
          <div className="option-grid">
            {current.options.map((option) => (
              <button
                key={option}
                className={`option-card ${form[current.field] === option ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, [current.field]: option })}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        ) : current.type === 'textarea' ? (
          <textarea value={form[current.field]} placeholder={current.placeholder} onChange={(event) => setForm({ ...form, [current.field]: event.target.value })} />
        ) : (
          <input type={current.type} value={form[current.field]} placeholder={current.placeholder} onChange={(event) => setForm({ ...form, [current.field]: event.target.value })} />
        )}
        {step === steps.length - 1 && (
          <input type="email" value={form.email} placeholder="Email для mock-заказа (необязательно)" onChange={(event) => setForm({ ...form, email: event.target.value })} />
        )}
        <div className="quiz-actions">
          <button className="secondary-button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Назад</button>
          <button className="primary-button" disabled={!canContinue || loading} onClick={next}>{loading ? 'Считаю...' : step === steps.length - 1 ? 'Показать результат' : 'Дальше'}</button>
        </div>
      </article>
    </section>
  )
}
