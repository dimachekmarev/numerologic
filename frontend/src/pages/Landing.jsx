import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import LanguageSwitch from "../components/LanguageSwitch";
import { reduceNumber } from "../utils/numerology";
import { api } from "../api";
import "./landing.css";

const copy = {
  ru: {
    nav: ["Метод", "Возможности", "Вопросы"],
    account: "Войти",
    start: "Начать с себя",
    explore: "Как это работает",
    eyebrow: "Личное пространство для ясности",
    heroA: ["У вас уже есть", "точка опоры."],
    heroB: ["Внутри вас —", "целая система."],
    introA:
      "Узнайте своё число. Задайте себе хороший вопрос. Превратите ответ в маленькое действие — в одном пространстве для себя.",
    introB:
      "Числа открывают вопросы. Дневник собирает мысли. Практики помогают двигаться. Найдите свою систему координат.",
    trialShort: "7 дней бесплатно после регистрации · Без банковской карты",
    scroll: "Откройте свою систему",
    sample: "Пример расчёта",
    yourResult: "Ваш расчёт",
    birth: "Дата рождения",
    lifePath: "Число жизненного пути",
    numberCta: "Исследовать свою карту",
    calculatorNote: "Суммируем цифры даты. Сохраняем 11, 22 и 33.",
    invalidDate: "Выберите действительную дату рождения не позднее сегодня.",
    numberNotes: {
      1: "Где я хочу проявить инициативу?",
      2: "Какой разговор давно откладываю?",
      3: "Чему хочу дать голос?",
      4: "Что поможет создать устойчивость?",
      5: "Где мне нужно больше свободы?",
      6: "Как я могу позаботиться о себе?",
      7: "Что я хочу понять глубже?",
      8: "Какие ресурсы у меня уже есть?",
      9: "Что я готов отпустить?",
      11: "Что помогает услышать себя?",
      22: "Какой замысел пора воплотить?",
      33: "Как поддержать себя и других?",
    },
    promptLabel: "Вопрос для размышления",
    previewNote: "Символическая интерпретация, не прогноз.",
    orbitLabel: "Карта возможностей",
    orbitCenter: "Вы",
    orbitTop: "Ясность",
    orbitLeft: "Мысли",
    orbitRight: "Действие",
    orbitBottom: "Ритм",
    smallPrint: "Не инструкция к жизни. Пространство для ваших решений.",
    strip: [
      "Открытый расчёт",
      "Числа 11 · 22 · 33",
      "Дневник и практики",
      "На русском и английском",
    ],
    methodLabel: "От символа к действию",
    methodTitle: ["Не готовые ответы.", "Ваши собственные."],
    methodIntro:
      "Numerologic соединяет символический язык чисел с понятными инструментами саморефлексии. Вы выбираете, что имеет смысл именно для вас.",
    steps: [
      [
        "01",
        "Посмотрите на себя иначе",
        "Карта по дате рождения — с видимой арифметикой и вопросами, которые помогают начать размышление.",
      ],
      [
        "02",
        "Заметьте, что важно",
        "Зафиксируйте мысль, настроение или повторяющуюся тему в дневнике. Не нужно писать целую страницу.",
      ],
      [
        "03",
        "Сделайте маленький шаг",
        "Выберите практику, обозначьте цель и вернитесь к своим заметкам через неделю. В собственном темпе.",
      ],
    ],
    toolsLabel: "Ваш повседневный набор",
    toolsTitle: ["Всё, чтобы", "вернуться к себе."],
    toolsIntro:
      "Меньше переключений. Больше внимания к тому, что происходит в вашей жизни.",
    tools: [
      [
        "map",
        "Личная карта",
        "Число пути, значения и мастер-числа 11, 22, 33. Расчёт можно проверить.",
        "Открыть числа",
        "/numbers",
      ],
      [
        "journal",
        "Дневник",
        "Мысли и настроение в одном месте. Возвращайтесь к записям, когда нужна перспектива.",
        "Открыть пространство",
        "/dashboard",
      ],
      [
        "calendar",
        "Календарь и цели",
        "Планируйте небольшие шаги, отмечайте действия и собирайте свой ритм.",
        "Посмотреть инструменты",
        "/dashboard",
      ],
      [
        "practice",
        "Практики",
        "Вопросы и упражнения для ясности, границ и диалога — с понятным следующим шагом.",
        "Выбрать практику",
        "/practices",
      ],
      [
        "week",
        "Обзор недели",
        "Вернитесь к событиям и заметкам. Сформулируйте, что хочется взять в следующую неделю.",
        "Открыть обзор",
        "/dashboard",
      ],
      [
        "pdf",
        "PDF-разборы",
        "Отдельные материалы, к которым можно вернуться в удобное время. Условия видны до покупки.",
        "Посмотреть разборы",
        "/numbers",
      ],
    ],
    demoLabel: "Маленький ритуал. Каждый день.",
    demoTitle: ["Пять минут,", "которые принадлежат вам."],
    demoIntro:
      "Не пытайтесь разобраться во всём сразу. Начните с одной мысли и одного посильного действия.",
    demoTag: "Пример интерфейса",
    demoTabs: ["Дневник", "Цель", "Неделя"],
    demos: [
      {
        title: "Что сегодня стало яснее?",
        body: "Мне не нужно решать всё сегодня. Я могу начать с самого важного.",
        label: "Настроение",
        chips: ["Спокойствие", "Интерес", "Нужна пауза"],
        foot: "Одна запись — уже начало.",
      },
      {
        title: "Оставить место для себя",
        body: "На этой неделе: выделить 10 минут на прогулку без телефона.",
        label: "Следующий шаг",
        chips: ["Выбрать время", "Выйти на улицу", "Заметить детали"],
        foot: "Небольшая цель. Понятное действие.",
      },
      {
        title: "Что хочется сохранить?",
        body: "Я замечаю больше ясности, когда делаю паузу перед новым делом.",
        label: "Вопрос на следующую неделю",
        chips: ["Что помогло?", "Что отпустить?", "С чего начать?"],
        foot: "Ваши наблюдения, ваш следующий шаг.",
      },
    ],
    demoAction: "Начать свой ритуал",
    journeyLabel: "Не на один вечер",
    journeyTitle: ["Ваши числа. Ваши слова.", "Ваш следующий шаг."],
    journeyIntro:
      "Личные ритуалы и маршрут на 30 дней помогают возвращаться к себе. Если вести записи, через месяц здесь будет история ваших маленьких шагов.",
    journeySteps: [
      [
        "01",
        "Начните сегодня",
        "Выберите один личный ритуал и запишите одну мысль.",
      ],
      [
        "07",
        "Вернитесь через неделю",
        "Посмотрите на заметки и отметьте, что хочется продолжить.",
      ],
      [
        "30",
        "Соберите свой месяц",
        "Месячный обзор объединяет ваши наблюдения и следующие шаги.",
      ],
    ],
    journeyAction: "Открыть свой маршрут",
    visualCaption: "ВАШИ ВНУТРЕННИЕ КООРДИНАТЫ",
    personalSystem: "ЛИЧНАЯ СИСТЕМА / 001",
    approachLabel: "Честный подход",
    approachTitle: ["Любопытство — да.", "Обещания будущего — нет."],
    approachBody:
      "Нумерология здесь — символический инструмент для размышления, а не научная диагностика. Числа не определяют ваш характер и не принимают решения за вас.",
    approachCards: [
      [
        "Прозрачный метод",
        "Вы видите, откуда берутся числа. У разных нумерологических школ бывают разные методы.",
      ],
      [
        "Ваш выбор",
        "Интерпретации — повод задать вопрос, а не обещание результата. Берите только то, что полезно.",
      ],
      [
        "Понятные условия",
        "Живой AI-помощник пока не подключён. Платные материалы и оплата оформляются отдельно.",
      ],
    ],
    faqLabel: "Всё просто",
    faqTitle: "Прежде чем начать",
    faqs: [
      [
        "Что я получу за 7 дней?",
        "После регистрации начинается бесплатный 7-дневный пробный период. Вы сможете познакомиться с личным пространством и доступными инструментами. Для старта не нужна банковская карта.",
      ],
      [
        "Это предсказания?",
        "Нет. Мы используем символические интерпретации как вопросы для саморефлексии. Numerologic не предсказывает будущее и не гарантирует изменения в жизни.",
      ],
      [
        "Как считается число пути?",
        "Мы складываем все цифры даты рождения и сокращаем сумму до одной цифры, сохраняя мастер-числа 11, 22 и 33. Пример расчёта можно проверить прямо на этой странице.",
      ],
      [
        "Будет ли автоматическое списание?",
        "Бесплатный пробный период начинается без банковской карты. Платные материалы и дальнейшая оплата — отдельное действие с условиями до покупки.",
      ],
      [
        "Есть ли AI-помощник?",
        "Живой AI-помощник пока не подключён. Вы можете пользоваться доступными инструментами саморефлексии; мы не предлагаем здесь ответы от работающего AI.",
      ],
    ],
    endLabel: "Начните с одного вопроса",
    endTitle: ["Что сейчас", "важно для вас?"],
    endBody: "Не нужно знать все ответы. Достаточно любопытства.",
    endCta: "Найти свою точку опоры",
    footer: "Числа. Мысли. Маленькие шаги.",
    footerLinks: ["Числа", "Практики", "Личный кабинет"],
    disclaimer:
      "Для саморефлексии. Не научная диагностика и не замена профессиональной помощи.",
  },
  en: {
    nav: ["Our approach", "Your tools", "Questions"],
    account: "Sign in",
    start: "Start with yourself",
    explore: "See how it works",
    eyebrow: "A personal space for clarity",
    heroA: ["Your starting point", "is already within."],
    heroB: ["A whole system.", "Within you."],
    introA:
      "Discover your number. Ask yourself a good question. Turn your answer into a small action — in one personal space.",
    introB:
      "Numbers open questions. A journal gathers thoughts. Practices create movement. Find your own coordinates.",
    trialShort: "7 days free after sign-up · No credit card required",
    scroll: "Discover your system",
    sample: "Example calculation",
    yourResult: "Your calculation",
    birth: "Date of birth",
    lifePath: "Life path number",
    numberCta: "Explore your own chart",
    calculatorNote: "We add the date’s digits, keeping 11, 22 and 33.",
    invalidDate: "Choose a valid date of birth that is not in the future.",
    numberNotes: {
      1: "Where do I want to take initiative?",
      2: "What conversation have I been putting off?",
      3: "What do I want to express?",
      4: "What would help me feel grounded?",
      5: "Where do I need more freedom?",
      6: "How can I care for myself?",
      7: "What do I want to understand deeply?",
      8: "What resources do I already have?",
      9: "What am I ready to let go of?",
      11: "What helps me listen to myself?",
      22: "Which idea am I ready to bring to life?",
      33: "How can I support myself and others?",
    },
    promptLabel: "A question to reflect on",
    previewNote: "A symbolic interpretation, not a prediction.",
    orbitLabel: "Your map of possibilities",
    orbitCenter: "You",
    orbitTop: "Clarity",
    orbitLeft: "Thought",
    orbitRight: "Action",
    orbitBottom: "Rhythm",
    smallPrint: "A space for your decisions. At your own pace.",
    strip: [
      "Transparent calculation",
      "Numbers 11 · 22 · 33",
      "Journal & practices",
      "In English & Russian",
    ],
    methodLabel: "From symbol to action",
    methodTitle: ["Better questions.", "Your own answers."],
    methodIntro:
      "Numerologic connects the symbolic language of numbers with practical tools for self-reflection. You choose what makes sense to you.",
    steps: [
      [
        "01",
        "See yourself differently",
        "A chart based on your birth date, with visible arithmetic and questions to start your reflection.",
      ],
      [
        "02",
        "Notice what matters",
        "Capture a thought, a mood or a recurring theme in your journal. A whole page is optional.",
      ],
      [
        "03",
        "Take a small step",
        "Choose a practice, set a goal and revisit your notes in a week. In your own time.",
      ],
    ],
    toolsLabel: "Your everyday toolkit",
    toolsTitle: ["A little space.", "A clearer perspective."],
    toolsIntro:
      "Fewer things to switch between. More attention to what is happening in your life.",
    tools: [
      [
        "map",
        "Personal chart",
        "Life path meanings and master numbers 11, 22, 33. Arithmetic you can check.",
        "Explore the numbers",
        "/numbers",
      ],
      [
        "journal",
        "Journal",
        "Thoughts and moods, in one place. Revisit your notes when you need perspective.",
        "Open your space",
        "/dashboard",
      ],
      [
        "calendar",
        "Calendar & goals",
        "Plan small steps, record your actions and find a rhythm that works for you.",
        "Explore your tools",
        "/dashboard",
      ],
      [
        "practice",
        "Practices",
        "Questions and exercises for clarity, boundaries and dialogue, with a clear next step.",
        "Choose a practice",
        "/practices",
      ],
      [
        "week",
        "Weekly reflection",
        "Revisit your days and notes. Decide what you want to carry into the coming week.",
        "Open your review",
        "/dashboard",
      ],
      [
        "pdf",
        "PDF guides",
        "Separate materials to revisit in your own time. Purchase terms are visible in advance.",
        "Explore the guides",
        "/numbers",
      ],
    ],
    demoLabel: "A small, daily ritual",
    demoTitle: ["Five minutes.", "Entirely yours."],
    demoIntro:
      "You don’t have to figure everything out at once. Start with one thought and one manageable action.",
    demoTag: "Example interface",
    demoTabs: ["Journal", "Goal", "Week"],
    demos: [
      {
        title: "What became clearer today?",
        body: "I don’t need to solve everything today. I can start with what matters most.",
        label: "Mood",
        chips: ["Calm", "Curious", "Need a pause"],
        foot: "One note is already a beginning.",
      },
      {
        title: "Make room for myself",
        body: "This week: take 10 minutes for a walk without my phone.",
        label: "Next step",
        chips: ["Choose a time", "Step outside", "Notice the details"],
        foot: "A small goal. A clear action.",
      },
      {
        title: "What do I want to keep?",
        body: "I notice more clarity when I take a pause before starting something new.",
        label: "A question for next week",
        chips: ["What helped?", "What can I release?", "Where to start?"],
        foot: "Your observations. Your next step.",
      },
    ],
    demoAction: "Start your own ritual",
    journeyLabel: "More than a single visit",
    journeyTitle: ["Your numbers. Your words.", "Your next step."],
    journeyIntro:
      "Personal rituals and a 30-day path give you a reason to return. As you keep notes, a month of small steps becomes a story you can revisit.",
    journeySteps: [
      [
        "01",
        "Start today",
        "Choose one personal ritual and capture one thought.",
      ],
      [
        "07",
        "Return in a week",
        "Revisit your notes and notice what you want to continue.",
      ],
      [
        "30",
        "Gather your month",
        "Your monthly review brings your observations and next steps together.",
      ],
    ],
    journeyAction: "Open your own path",
    visualCaption: "YOUR INNER COORDINATES",
    personalSystem: "PERSONAL SYSTEM / 001",
    approachLabel: "An honest approach",
    approachTitle: ["Room for curiosity.", "No promises of the future."],
    approachBody:
      "Numerology here is a symbolic tool for reflection, not a scientific assessment. Numbers do not define your character or make decisions for you.",
    approachCards: [
      [
        "A transparent method",
        "See where your numbers come from. Different numerology traditions may use different methods.",
      ],
      [
        "Your choice",
        "Interpretations are an invitation to ask a question, not a promise of results. Keep what is useful.",
      ],
      [
        "Clear expectations",
        "A live AI assistant is not connected yet. Paid materials and payments are handled separately.",
      ],
    ],
    faqLabel: "A simple beginning",
    faqTitle: "Before you start",
    faqs: [
      [
        "What do I get for 7 days?",
        "Your free 7-day trial begins after registration. It is a chance to explore your personal space and the available tools. You do not need a credit card to start.",
      ],
      [
        "Are these predictions?",
        "No. We use symbolic interpretations as prompts for self-reflection. Numerologic does not predict the future or guarantee changes in your life.",
      ],
      [
        "How is the life path number calculated?",
        "We add all the digits of your date of birth, then reduce the sum to a single digit while keeping master numbers 11, 22 and 33. You can check an example on this page.",
      ],
      [
        "Will I be charged automatically?",
        "The free trial starts without a credit card. Paid materials and further payments are separate actions, with terms shown before purchase.",
      ],
      [
        "Is there an AI assistant?",
        "A live AI assistant is not connected yet. You can use the available self-reflection tools; we do not present answers from a working AI here.",
      ],
    ],
    endLabel: "Start with a single question",
    endTitle: ["What matters", "to you right now?"],
    endBody: "You don’t need all the answers. Just a little curiosity.",
    endCta: "Find your starting point",
    footer: "Numbers. Thoughts. Small steps.",
    footerLinks: ["Numbers", "Practices", "Your account"],
    disclaimer:
      "For self-reflection. Not a scientific assessment or a substitute for professional help.",
  },
};

function Arrow({ diagonal = false }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M10 23V9l12 14V9M7 16h18"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function ToolIcon({ name }) {
  const paths = {
    map: "M12 3 3 8v9l9 5 9-5V8l-9-5Zm0 0v19M3 8l9 5 9-5",
    journal: "M5 3h13l2 2v16H5V3Zm4 5h7M9 12h7M9 16h4",
    calendar: "M4 6h16v15H4V6Zm0 5h16M8 3v5M16 3v5M8 15h1M12 15h1M16 15h1",
    practice: "M12 3v18M3 12h18M6 6l12 12M6 18 18 6",
    week: "M4 19h16M6 15v-4M10 15V7M14 15V9M18 15V4",
    pdf: "M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6M9 16h4",
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Calculator({ t, variant, quiz }) {
  const id = useId();
  const [date, setDate] = useState("1994-06-18");
  const [changed, setChanged] = useState(false);
  const now = new Date();
  const max = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const parsed = new Date(`${date}T12:00:00`);
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(parsed.getTime()) &&
    date <= max &&
    parsed.getFullYear() > 0;
  const number = valid ? reduceNumber(date) : null;
  const sum = valid
    ? [...date].reduce((s, c) => s + (/\d/.test(c) ? Number(c) : 0), 0)
    : null;
  const chain = [sum];
  if (valid)
    while (chain.at(-1) > 9 && ![11, 22, 33].includes(chain.at(-1)))
      chain.push([...String(chain.at(-1))].reduce((s, c) => s + Number(c), 0));
  return (
    <div className={`nl-calculator nl-calculator-${variant}`}>
      <div className="nl-calc-top">
        <span className="nl-dot" />
        {changed ? t.yourResult : t.sample}
        <span className="nl-calc-index">01 / 09</span>
      </div>
      <div className="nl-calc-result" aria-live="polite" aria-atomic="true">
        <span className="nl-result-number">{number ?? "—"}</span>
        <div>
          <span className="nl-micro">{t.lifePath}</span>
          <span className="nl-arithmetic">
            {valid ? chain.join(" → ") : "—"}
          </span>
        </div>
      </div>
      <div className="nl-calc-input">
        <label htmlFor={id}>{t.birth}</label>
        <input
          id={id}
          type="date"
          value={date}
          max={max}
          min="0001-01-01"
          onChange={(e) => {
            setDate(e.target.value);
            setChanged(true);
          }}
          aria-describedby={`${id}-note`}
          aria-invalid={!valid}
        />
      </div>
      <p id={`${id}-note`} className="nl-calc-note">
        {valid ? t.calculatorNote : t.invalidDate}
      </p>
      <div className="nl-question" aria-live="polite">
        <span className="nl-micro">{t.promptLabel}</span>
        <p>{valid ? t.numberNotes[number] : "—"}</p>
      </div>
      <Link className="nl-calc-link" to={quiz}>
        {t.numberCta}
        <Arrow />
      </Link>
      <span className="nl-calc-disclaimer">{t.previewNote}</span>
    </div>
  );
}

function Orbit({ t }) {
  return (
    <div className="nl-orbit" role="img" aria-label={t.orbitLabel}>
      <svg
        className="nl-orbit-svg"
        viewBox="0 0 600 600"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="nl-core-glow">
            <stop stopColor="#8d9cf4" stopOpacity=".25" />
            <stop offset="1" stopColor="#8d9cf4" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="250" fill="url(#nl-core-glow)" />
        <g stroke="currentColor">
          <circle
            cx="300"
            cy="300"
            r="235"
            strokeDasharray="2 10"
            opacity=".45"
          />
          <circle cx="300" cy="300" r="175" opacity=".3" />
          <circle cx="300" cy="300" r="113" opacity=".35" />
          <ellipse
            cx="300"
            cy="300"
            rx="235"
            ry="82"
            transform="rotate(-35 300 300)"
            opacity=".55"
          />
          <ellipse
            cx="300"
            cy="300"
            rx="235"
            ry="82"
            transform="rotate(35 300 300)"
            opacity=".35"
          />
          <path d="M300 65v470M65 300h470" opacity=".2" />
        </g>
        <g fill="#c7d0ff">
          <circle cx="300" cy="65" r="4" />
          <circle cx="65" cy="300" r="4" />
          <circle cx="535" cy="300" r="4" />
          <circle cx="300" cy="535" r="4" />
          <circle cx="450" cy="120" r="3" />
          <circle cx="176" cy="150" r="3" />
          <circle cx="460" cy="430" r="3" />
        </g>
      </svg>
      <span className="nl-orbit-center">
        <Mark />
        <small>{t.orbitCenter}</small>
      </span>
      <span className="nl-orbit-label nl-orbit-top">
        01 <b>{t.orbitTop}</b>
      </span>
      <span className="nl-orbit-label nl-orbit-left">
        02 <b>{t.orbitLeft}</b>
      </span>
      <span className="nl-orbit-label nl-orbit-right">
        03 <b>{t.orbitRight}</b>
      </span>
      <span className="nl-orbit-label nl-orbit-bottom">
        04 <b>{t.orbitBottom}</b>
      </span>
      <span className="nl-map-coordinate">N 11° · E 22°</span>
    </div>
  );
}

function Demo({ t, quiz }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const demo = t.demos[active];
  return (
    <section className="nl-demo-section nl-wrap">
      <div className="nl-demo-copy">
        <span className="nl-eyebrow">{t.demoLabel}</span>
        <h2>
          {t.demoTitle[0]}
          <br />
          <em>{t.demoTitle[1]}</em>
        </h2>
        <p>{t.demoIntro}</p>
        <Link className="nl-text-link" to={quiz}>
          {t.demoAction}
          <Arrow />
        </Link>
      </div>
      <div className="nl-demo-card">
        <div className="nl-demo-card-head">
          <Mark />
          <span>{t.demoTag}</span>
          <span className="nl-demo-dot" />
        </div>
        <div className="nl-demo-tabs" role="tablist" aria-label={t.demoTag}>
          {t.demoTabs.map((tab, i) => (
            <button
              key={tab}
              id={`${id}-tab-${i}`}
              role="tab"
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = (active + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                  setActive(next);
                  document.getElementById(`${id}-tab-${next}`)?.focus();
                }
                if (e.key === "Home" || e.key === "End") {
                  e.preventDefault();
                  const next = e.key === "Home" ? 0 : 2;
                  setActive(next);
                  document.getElementById(`${id}-tab-${next}`)?.focus();
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div
          className="nl-demo-content"
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${active}`}
          tabIndex={0}
        >
          <h3>{demo.title}</h3>
          <div className="nl-demo-paper">
            <span className="nl-quote-mark">“</span>
            <p>{demo.body}</p>
          </div>
          <span className="nl-micro">{demo.label}</span>
          <div className="nl-demo-chips">
            {demo.chips.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <p className="nl-demo-foot">{demo.foot}</p>
        </div>
      </div>
    </section>
  );
}

export default function Landing({ variant = "a" }) {
  const { language } = useI18n();
  const t = copy[language === "en" ? "en" : "ru"];
  const v = variant === "b" ? "b" : "a";
  const trackedVariant = useRef(null);
  useEffect(() => {
    if (trackedVariant.current === v) return;
    trackedVariant.current = v;
    void api.track("landing_view", { variant: v, source: "landing" });
  }, [v]);
  const quiz = `/quiz?utm_source=landing&utm_content=${v}`;
  const hero = v === "a" ? t.heroA : t.heroB;
  return (
    <div
      className={`nl-landing nl-${v}`}
      lang={language === "en" ? "en" : "ru"}
    >
      <a className="nl-skip" href="#nl-main">
        {language === "en" ? "Skip to content" : "К содержанию"}
      </a>
      <header className="nl-header nl-wrap">
        <Link
          to={`/landing-${v}`}
          className="nl-brand"
          aria-label="Numerologic"
        >
          <Mark />
          <span>
            numerologic<span className="nl-brand-period">.</span>
          </span>
        </Link>
        <nav
          className="nl-nav"
          aria-label={
            language === "en" ? "Main navigation" : "Основная навигация"
          }
        >
          {t.nav.map((n, i) => (
            <a key={n} href={`#${["nl-method", "nl-tools", "nl-faq"][i]}`}>
              {n}
            </a>
          ))}
        </nav>
        <div className="nl-header-actions">
          <LanguageSwitch />
          <Link className="nl-login" to="/account">
            {t.account}
            <Arrow diagonal />
          </Link>
        </div>
      </header>
      <main id="nl-main" className="nl-main">
        <section className="nl-hero nl-wrap">
          <div className="nl-hero-copy">
            <span className="nl-eyebrow">
              <span className="nl-tiny-star">✳</span>
              {t.eyebrow}
            </span>
            <h1>
              {hero[0]}
              <br />
              <em>{hero[1]}</em>
            </h1>
            <p className="nl-hero-intro">{v === "a" ? t.introA : t.introB}</p>
            <div className="nl-hero-actions">
              <Link to={quiz} className="nl-button">
                {t.start}
                <Arrow />
              </Link>
              <a href="#nl-method" className="nl-hero-secondary">
                {t.explore}
              </a>
            </div>
            <p className="nl-trial-note">{t.trialShort}</p>
          </div>
          {v === "a" ? (
            <div className="nl-hero-visual">
              <div className="nl-hero-orbits" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span className="nl-visual-caption">{t.visualCaption}</span>
              <Calculator t={t} variant={v} quiz={quiz} />
              <span className="nl-art-signature" aria-hidden="true">
                N / 11
              </span>
            </div>
          ) : (
            <div className="nl-hero-visual">
              <Orbit t={t} />
              <div className="nl-hero-chart-caption">
                <span>{t.personalSystem}</span>
                <span>11 · 22 · 33</span>
              </div>
            </div>
          )}
        </section>
        {v === "b" && (
          <div className="nl-b-hero-foot nl-wrap">
            <a href="#nl-method">
              <span className="nl-scroll-icon">↓</span>
              {t.scroll}
            </a>
            <p>{t.smallPrint}</p>
          </div>
        )}
        <div className="nl-proof-strip">
          <div className="nl-wrap">
            {t.strip.map((s, i) => (
              <span key={s}>
                <span className="nl-strip-symbol" aria-hidden="true">
                  {["⊕", "✳", "↗", "◎"][i]}
                </span>
                {s}
              </span>
            ))}
          </div>
        </div>
        <section id="nl-method" className="nl-method nl-wrap nl-section">
          <div className="nl-section-heading">
            <span className="nl-eyebrow">{t.methodLabel}</span>
            <h2>
              {t.methodTitle[0]}
              <br />
              <em>{t.methodTitle[1]}</em>
            </h2>
            <p>{t.methodIntro}</p>
          </div>
          <div className="nl-steps">
            {t.steps.map(([n, title, body]) => (
              <article className="nl-step" key={n}>
                <div className="nl-step-top">
                  <span className="nl-step-number">{n}</span>
                  <span className="nl-step-line" />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
        {v === "b" && (
          <section className="nl-b-calculation nl-wrap">
            <div>
              <span className="nl-eyebrow">{t.strip[0]}</span>
              <h2>
                {t.lifePath}
                <br />
                <em>11 / 22 / 33</em>
              </h2>
              <p>{t.calculatorNote}</p>
            </div>
            <Calculator t={t} variant={v} quiz={quiz} />
          </section>
        )}
        <section id="nl-tools" className="nl-tools nl-section">
          <div className="nl-wrap">
            <div className="nl-section-heading nl-heading-split">
              <div>
                <span className="nl-eyebrow">{t.toolsLabel}</span>
                <h2>
                  {t.toolsTitle[0]}
                  <br />
                  <em>{t.toolsTitle[1]}</em>
                </h2>
              </div>
              <p>{t.toolsIntro}</p>
            </div>
            <div className="nl-tools-grid">
              {t.tools.map(([icon, title, body, label, to], i) => (
                <article key={icon} className={`nl-tool nl-tool-${icon}`}>
                  <div className="nl-tool-head">
                    <span className="nl-tool-icon">
                      <ToolIcon name={icon} />
                    </span>
                    <span className="nl-tool-index">0{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <Link to={to} className="nl-tool-link">
                    {label}
                    <Arrow diagonal />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
        <Demo t={t} quiz={quiz} />
        <section className="nl-journey nl-wrap">
          <div className="nl-journey-heading">
            <span className="nl-eyebrow">{t.journeyLabel}</span>
            <h2>
              {t.journeyTitle[0]}
              <br />
              <em>{t.journeyTitle[1]}</em>
            </h2>
            <p>{t.journeyIntro}</p>
            <Link to="/dashboard" className="nl-text-link">
              {t.journeyAction}
              <Arrow />
            </Link>
          </div>
          <div className="nl-journey-steps">
            {t.journeySteps.map(([n, title, body]) => (
              <article key={n}>
                <span className="nl-journey-number">{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="nl-approach nl-wrap nl-section">
          <div className="nl-approach-heading">
            <span className="nl-eyebrow">{t.approachLabel}</span>
            <h2>
              {t.approachTitle[0]}
              <br />
              <em>{t.approachTitle[1]}</em>
            </h2>
            <p>{t.approachBody}</p>
          </div>
          <div className="nl-approach-items">
            {t.approachCards.map(([title, body], i) => (
              <article key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="nl-faq" className="nl-faq nl-wrap nl-section">
          <div>
            <span className="nl-eyebrow">{t.faqLabel}</span>
            <h2>{t.faqTitle}</h2>
          </div>
          <div className="nl-faq-items">
            {t.faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="nl-final">
          <div className="nl-final-art" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="nl-wrap">
            <span className="nl-eyebrow">{t.endLabel}</span>
            <h2>
              {t.endTitle[0]}
              <br />
              <em>{t.endTitle[1]}</em>
            </h2>
            <p>{t.endBody}</p>
            <Link className="nl-button" to={quiz}>
              {t.endCta}
              <Arrow />
            </Link>
            <p className="nl-trial-note">{t.trialShort}</p>
          </div>
        </section>
      </main>
      <footer className="nl-footer nl-wrap">
        <div className="nl-footer-top">
          <div>
            <Link className="nl-brand" to={`/landing-${v}`}>
              <Mark />
              <span>numerologic.</span>
            </Link>
            <p>{t.footer}</p>
          </div>
          <nav
            aria-label={
              language === "en" ? "Footer navigation" : "Навигация в подвале"
            }
          >
            {t.footerLinks.map((s, i) => (
              <Link key={s} to={["/numbers", "/practices", "/account"][i]}>
                {s}
              </Link>
            ))}
          </nav>
        </div>
        <div className="nl-footer-bottom">
          <span>© {new Date().getFullYear()} Numerologic</span>
          <p>{t.disclaimer}</p>
          <span>RU / EN</span>
        </div>
      </footer>
    </div>
  );
}
