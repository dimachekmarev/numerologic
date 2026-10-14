import { useI18n } from "../i18n";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
export default function Quiz() {
  const { t: tr } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const birth = params.get("birth_date") || "";
  const prefilledBirth =
    /^\d{4}-\d{2}-\d{2}$/.test(birth) &&
    birth >= "1900-01-01" &&
    birth <= localDay()
      ? birth
      : "";
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    birth_date: prefilledBirth,
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
        placeholder: "Например, Анна",
      },
      {
        title: "Дата рождения",
        field: "birth_date",
        type: "date",
      },
      {
        title: "Что хочется прояснить?",
        field: "focus",
        options: focusOptions,
      },
      {
        title: "Контекст отношений",
        field: "relationship_status",
        options: relationshipOptions,
      },
      {
        title: "Ваш вопрос к периоду",
        field: "question",
        type: "textarea",
        placeholder: "Что сейчас повторяется или требует ясности?",
      },
    ],
    [],
  );
  const current = steps[step];
  const canContinue =
    current.options ||
    current.field === "question" ||
    (String(form[current.field] || "").trim().length > 0 &&
      (current.type !== "date" ||
        (form.birth_date >= "1900-01-01" && form.birth_date <= localDay())));
  async function submit() {
    setLoading(true);
    try {
      const payload = {
        ...form,
        email: form.email || undefined,
      };
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
  return (
    <section className="quiz-page narrow-page">
      <div className="progress-shell">
        <span>
          {tr("Шаг")} {step + 1} {tr("из")} {steps.length}
        </span>
        <div className="progress-bar">
          <i
            style={{
              width: `${((step + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
      <article className="quiz-card glass-card">
        <span className="eyebrow">
          {tr("\u041C\u0438\u043D\u0438-\u0440\u0430\u0437\u0431\u043E\u0440")}
        </span>
        <h1>{tr(current.title)}</h1>
        {tr(
          current.options ? (
            <div className="option-grid">
              {tr(
                current.options.map((option) => (
                  <button
                    key={option}
                    className={`option-card ${form[current.field] === option ? "selected" : ""}`}
                    onClick={() =>
                      setForm({
                        ...form,
                        [current.field]: option,
                      })
                    }
                    type="button"
                  >
                    {tr(option)}
                  </button>
                )),
              )}
            </div>
          ) : current.type === "textarea" ? (
            <textarea
              value={form[current.field]}
              placeholder={tr(current.placeholder)}
              onChange={(event) =>
                setForm({
                  ...form,
                  [current.field]: event.target.value,
                })
              }
            />
          ) : (
            <input
              aria-label={tr(current.title)}
              min={current.type === "date" ? "1900-01-01" : undefined}
              max={current.type === "date" ? localDay() : undefined}
              maxLength={128}
              type={current.type}
              value={form[current.field]}
              placeholder={tr(current.placeholder)}
              onChange={(event) =>
                setForm({
                  ...form,
                  [current.field]: event.target.value,
                })
              }
            />
          ),
        )}
        {tr(
          step === steps.length - 1 && (
            <input
              type="email"
              value={form.email}
              placeholder={tr("Email (необязательно)")}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
            />
          ),
        )}
        {tr(
          error && (
            <p role="alert" className="error">
              {tr(error)}
            </p>
          ),
        )}
        <div className="quiz-actions">
          <button
            className="secondary-button"
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
          >
            {tr("\u041D\u0430\u0437\u0430\u0434")}
          </button>
          <button
            className="primary-button"
            disabled={!canContinue || loading}
            onClick={next}
          >
            {tr(
              loading
                ? "Считаю..."
                : step === steps.length - 1
                  ? "Показать результат"
                  : "Дальше",
            )}
          </button>
        </div>
      </article>
    </section>
  );
}
