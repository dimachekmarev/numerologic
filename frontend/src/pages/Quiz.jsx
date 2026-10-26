import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { localDay } from "../hooks";

const focusOptions = [
  "Ясность",
  "Отношения",
  "Деньги и реализация",
  "Период жизни",
];
const relationshipOptions = [
  "в отношениях",
  "в поиске",
  "выбираю себя",
  "сложно ответить",
];

const encouragements = [
  "Отлично! Осталось совсем немного",
  "Прекрасно! Ваш профиль формируется",
  "Замечательно! Почти готово",
  "Отлично! Последний шаг",
];

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    birth_date: "",
    focus: "Ясность",
    relationship_status: "сложно ответить",
    question: "",
    email: "",
  });

  const steps = useMemo(
    () => [
      {
        title: "Как к вам обращаться?",
        field: "name",
        type: "text",
        placeholder: "Например, Дмитрий",
        hint: "Имя поможет персонализировать разбор",
      },
      { 
        title: "Дата рождения", 
        field: "birth_date", 
        type: "date",
        hint: "Нужна для расчёта чисел вашего пути",
      },
      {
        title: "Что хочется прояснить?",
        field: "focus",
        options: focusOptions,
        hint: "Выберите то, что резонирует сейчас",
      },
      {
        title: "Контекст отношений",
        field: "relationship_status",
        options: relationshipOptions,
        hint: "Это поможет точнее подобрать практики",
      },
      {
        title: "Ваш вопрос к периоду",
        field: "question",
        type: "textarea",
        placeholder: "Что сейчас повторяется или требует ясности?",
        hint: "Можете пропустить — но вопрос поможет сфокусировать разбор",
      },
    ],
    [],
  );

  const current = steps[step];
  const canContinue =
    current.options ||
    (String(form[current.field] || "").trim().length > 0 &&
      (current.type !== "date" ||
        (form.birth_date >= "1900-01-01" && form.birth_date <= localDay())));

  async function submit() {
    setLoading(true);
    try {
      const payload = { ...form, email: form.email || undefined };
      const result = await api.completeQuiz(payload);
      localStorage.setItem("numerologic_quiz", JSON.stringify(payload));
      localStorage.setItem("numerologic_result", JSON.stringify(result));
      api.track("quiz_completed");
      navigate("/result");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (step < steps.length - 1) setStep((value) => value + 1);
    else submit();
  }

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <section className="quiz-page narrow-page">
      <div className="quiz-header">
        <span className="eyebrow">Мини-разбор · бесплатно</span>
        <h1>Узнайте свой ритм за 5 минут</h1>
        <p>Без регистрации. Без карты. Результат сразу.</p>
      </div>
      
      <div className="progress-shell">
        <div className="progress-info">
          <span>Шаг {step + 1} из {steps.length}</span>
          <span className="progress-percent">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <i style={{ width: `${progress}%` }} />
        </div>
        {step > 0 && step < steps.length && (
          <p className="encouragement">{encouragements[step - 1]}</p>
        )}
      </div>

      <article className="quiz-card glass-card">
        <div className="quiz-question-header">
          <span className="quiz-step-badge">{step + 1}</span>
          <h2>{current.title}</h2>
        </div>
        
        {current.hint && <p className="quiz-hint">{current.hint}</p>}

        {current.options ? (
          <div className="option-grid">
            {current.options.map((option) => (
              <button
                key={option}
                className={`option-card ${form[current.field] === option ? "selected" : ""}`}
                onClick={() => setForm({ ...form, [current.field]: option })}
                type="button"
              >
                <span className="option-check">
                  {form[current.field] === option ? "✓" : ""}
                </span>
                {option}
              </button>
            ))}
          </div>
        ) : current.type === "textarea" ? (
          <textarea
            value={form[current.field]}
            placeholder={current.placeholder}
            onChange={(event) =>
              setForm({ ...form, [current.field]: event.target.value })
            }
            rows={4}
          />
        ) : (
          <input
            aria-label={current.title}
            min={current.type === "date" ? "1900-01-01" : undefined}
            max={current.type === "date" ? localDay() : undefined}
            maxLength={128}
            type={current.type}
            value={form[current.field]}
            placeholder={current.placeholder}
            onChange={(event) =>
              setForm({ ...form, [current.field]: event.target.value })
            }
            autoFocus
          />
        )}

        {step === steps.length - 1 && (
          <div className="email-capture">
            <label>
              Email (необязательно)
              <input
                type="email"
                value={form.email}
                placeholder="Чтобы сохранить результат"
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <small>Пришлём ссылку на результат, если закроете вкладку</small>
          </div>
        )}

        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}

        <div className="quiz-actions">
          <button
            className="secondary-button"
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
          >
            ← Назад
          </button>
          <button
            className="primary-button cta-primary"
            disabled={!canContinue || loading}
            onClick={next}
          >
            {loading
              ? "Считаю ваш ритм..."
              : step === steps.length - 1
                ? "Показать результат ✦"
                : "Дальше →"}
          </button>
        </div>

        <div className="quiz-trust">
          <span>🔒</span>
          <small>Ваши данные защищены и не передаются третьим лицам</small>
        </div>
      </article>

      <div className="quiz-benefits">
        <div className="benefit-item">
          <span>✦</span>
          <small>Персональная карта чисел</small>
        </div>
        <div className="benefit-item">
          <span>📝</span>
          <small>Тема дня и первая практика</small>
        </div>
        <div className="benefit-item">
          <span>🎯</span>
          <small>Рекомендация под ваш запрос</small>
        </div>
      </div>
    </section>
  );
}
