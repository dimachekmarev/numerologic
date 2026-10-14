import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import { meanings } from "../utils/numerology";
import "./number-orbit.css";

const nodes = [
  { key: "life_path", x: 50, y: 49 },
  { key: "destiny", x: 50, y: 10 },
  { key: "soul", x: 80, y: 36 },
  { key: "personality", x: 69, y: 79 },
  { key: "year", x: 31, y: 79 },
  { key: "month", x: 20, y: 36 },
];

const text = {
  ru: {
    eyebrow: "Ваша система координат",
    title: "Посмотрите на связь чисел.",
    intro:
      "Выберите число на карте и исследуйте его тему. Все значения — из вашего сохранённого профиля.",
    group: "Числа персональной карты",
    hint: "Выберите точку на орбите",
    theme: "Символическая тема",
    master: "Мастер-число",
    next: "Записать свою мысль",
    calculation: "Расчёт числа жизненного пути",
    arithmeticNote:
      "Сумма цифр даты рождения. В этой системе 11, 22 и 33 сохраняются.",
    unavailable: "Значение пока недоступно",
    labels: {
      life_path: "Жизненный путь",
      destiny: "Число имени",
      soul: "Внутренний запрос",
      personality: "Внешнее выражение",
      year: "Личный год",
      month: "Личный месяц",
    },
    descriptions: {
      life_path:
        "Дата рождения — отправная точка карты. Какая часть этой темы отзывается в вашей жизни сейчас?",
      destiny:
        "Это число складывается из букв имени. Каким своим идеям вы хотите дать форму?",
      soul: "В расчёте участвуют гласные имени. Что вы хотите сохранить для себя, даже если об этом пока не говорите?",
      personality:
        "Это число связано с согласными имени. Как вы хотите выражать себя в разговоре с другими?",
      year: "День и месяц рождения вместе с текущим годом задают символическую тему. Чему вы хотите уделить внимание в этом году?",
      month:
        "Число личного года и текущий месяц дают ещё один повод для размышления. Какой небольшой шаг сейчас уместен?",
    },
  },
  en: {
    eyebrow: "Your personal coordinates",
    title: "Explore how your numbers connect.",
    intro:
      "Select a number to explore its theme. Every value comes from your saved profile.",
    group: "Your personal chart numbers",
    hint: "Select a point on the orbit",
    theme: "A symbolic theme",
    master: "Master number",
    next: "Capture your thought",
    calculation: "Life path calculation",
    arithmeticNote:
      "The sum of your birth date’s digits. This system keeps 11, 22 and 33.",
    unavailable: "This value is not available yet",
    labels: {
      life_path: "Life path",
      destiny: "Name number",
      soul: "Inner motivation",
      personality: "Outer expression",
      year: "Personal year",
      month: "Personal month",
    },
    descriptions: {
      life_path:
        "Your date of birth is the starting point of the chart. Which part of this theme resonates with your life right now?",
      destiny:
        "This number comes from the letters of your name. Which of your ideas would you like to bring to life?",
      soul: "The calculation uses your name’s vowels. What would you like to keep for yourself, even if you haven’t spoken about it yet?",
      personality:
        "This number comes from your name’s consonants. How would you like to express yourself in conversation with others?",
      year: "Your birth day and month, together with the current year, suggest a symbolic theme. What would you like to focus on this year?",
      month:
        "Your personal year number and the current month offer another reflection prompt. What small step feels appropriate now?",
    },
  },
};

function hasNumber(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}

export default function NumberOrbit({ profile }) {
  const { language, t: tr } = useI18n();
  const t = text[language === "en" ? "en" : "ru"];
  const [selected, setSelected] = useState("life_path");
  const refs = useRef([]);
  const id = useId();
  const value = profile[selected];
  const available = hasNumber(value);
  const activeNode = nodes.find((node) => node.key === selected);

  function navigate(event, index) {
    const directions = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let next;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = nodes.length - 1;
    else if (directions[event.key])
      next = (index + directions[event.key] + nodes.length) % nodes.length;
    else return;
    event.preventDefault();
    if (hasNumber(profile[nodes[next].key])) {
      setSelected(nodes[next].key);
      refs.current[next]?.focus();
    }
  }

  return (
    <section className="number-orbit-card" aria-labelledby={`${id}-title`}>
      <div className="number-orbit-heading">
        <span className="eyebrow">{t.eyebrow}</span>
        <h2 id={`${id}-title`}>{t.title}</h2>
        <p>{t.intro}</p>
      </div>
      <div className="number-orbit-layout">
        <div className="number-orbit-visual">
          <div className="number-orbit-map" role="group" aria-label={t.group}>
            <svg
              className="number-orbit-lines"
              viewBox="0 0 600 600"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="300"
                cy="294"
                r="222"
                stroke="currentColor"
                strokeDasharray="2 10"
                opacity=".3"
              />
              <ellipse
                cx="300"
                cy="294"
                rx="210"
                ry="195"
                stroke="currentColor"
                opacity=".2"
              />
              <ellipse
                cx="300"
                cy="294"
                rx="215"
                ry="99"
                transform="rotate(-32 300 294)"
                stroke="currentColor"
                opacity=".18"
              />
              <circle
                cx="300"
                cy="294"
                r="109"
                stroke="currentColor"
                opacity=".18"
              />
              {nodes.slice(1).map((node) => (
                <path
                  key={node.key}
                  d={`M300 294L${node.x * 6} ${node.y * 6}`}
                  stroke="currentColor"
                  strokeDasharray="3 7"
                  opacity=".18"
                />
              ))}
              {selected !== "life_path" && (
                <path
                  className="number-orbit-selected-line"
                  d={`M300 294L${activeNode.x * 6} ${activeNode.y * 6}`}
                  stroke="currentColor"
                  strokeWidth="2"
                />
              )}
            </svg>
            {nodes.map((node, index) => (
              <button
                type="button"
                key={node.key}
                ref={(el) => {
                  refs.current[index] = el;
                }}
                className={`number-orbit-node ${node.key === "life_path" ? "number-orbit-center" : ""} ${selected === node.key ? "is-selected" : ""}`}
                style={{ "--node-x": `${node.x}%`, "--node-y": `${node.y}%` }}
                aria-label={`${t.labels[node.key]}: ${hasNumber(profile[node.key]) ? profile[node.key] : t.unavailable}`}
                aria-pressed={selected === node.key}
                aria-controls={`${id}-detail`}
                disabled={!hasNumber(profile[node.key])}
                onClick={() => setSelected(node.key)}
                onKeyDown={(event) => navigate(event, index)}
              >
                <span className="number-orbit-node-value">
                  {hasNumber(profile[node.key]) ? profile[node.key] : "—"}
                </span>
                <span className="number-orbit-node-label">
                  {t.labels[node.key]}
                </span>
              </button>
            ))}
          </div>
          <p className="number-orbit-hint">
            <span aria-hidden="true">⊕</span>
            {t.hint}
          </p>
        </div>
        <div
          className="number-orbit-detail"
          id={`${id}-detail`}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="number-orbit-detail-top">
            <span className="number-orbit-detail-value">
              {available ? value : "—"}
            </span>
            <div>
              <span className="number-orbit-detail-label">
                {t.labels[selected]}
              </span>
              {available && [11, 22, 33].includes(Number(value)) && (
                <span className="number-orbit-master">{t.master}</span>
              )}
            </div>
          </div>
          <span className="number-orbit-caption">{t.theme}</span>
          <h3>
            {available ? tr(meanings[value]) || t.unavailable : t.unavailable}
          </h3>
          <p>{t.descriptions[selected]}</p>
          <Link to="/journal" className="number-orbit-journal">
            {t.next}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="number-orbit-arithmetic">
        <span className="number-orbit-caption">{t.calculation}</span>
        <p>{profile.arithmetic || "—"}</p>
        <small>{t.arithmeticNote}</small>
      </div>
    </section>
  );
}
