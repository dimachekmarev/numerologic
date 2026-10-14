import { useEffect, useId, useState } from "react";
import { reduceNumber } from "../utils/numerology";
import { api } from "../api";
import { useI18n } from "../i18n";
import { Link } from "react-router-dom";
import GentleIcon from "../components/GentleIcon";
import ProductCard from "../components/ProductCard";
import { products, formatPrice } from "../data/products";
const words = {
  ru: {
    eyebrow: "Маленькое пространство. Большая забота о себе.",
    title: "Здесь можно",
    titleEm: "услышать себя.",
    intro:
      "Отложить чужие ожидания. Разобраться в своих желаниях. И найти то, что поддерживает именно вас — через числа, дневник и маленькие ежедневные ритуалы.",
    start: "Начать знакомство с собой",
    open: "У меня уже есть пространство",
    free: "7 дней бесплатно после регистрации · Без карты",
    photo: "Чашка чая, чистая страница и немного времени для себя",
    photoCaption: "ваш тихий уголок",
    cardLabel: "Напоминание на сегодня",
    card: "Вам не нужно успевать всё.",
    cardSub: "Для начала — просто побудьте с собой.",
    ribbon: [
      "В своём темпе",
      "Без сравнения с другими",
      "Наедине с собой",
      "С заботой каждый день",
    ],
    toolsEyebrow: "То, к чему хочется возвращаться",
    toolsTitle: "Ближе к себе.",
    toolsEm: "День за днём.",
    toolsIntro:
      "Иногда нужен хороший вопрос. Иногда — место, где можно выговориться. Здесь есть и то, и другое.",
    tools: [
      [
        "flower",
        "Ваша история в числах",
        "Посмотрите на знакомые стороны себя по-новому. Личная карта по дате рождения — с понятным расчётом и вопросами для размышления.",
        "Открыть свою карту",
        "/numbers",
        "rose",
      ],
      [
        "journal",
        "Страница только для вас",
        "Радости, тревоги, маленькие открытия. Запишите всё, как есть. Здесь ваши мысли могут просто быть — без оценки и правильных ответов.",
        "Открыть дневник",
        "/journal",
        "sage",
      ],
      [
        "sun",
        "Ваши маленькие ритуалы",
        "Пять минут утром, прогулка или пауза перед сном. Выберите то, что вам близко, и постепенно найдите свой ритм.",
        "Найти свой ритуал",
        "/rituals",
        "butter",
      ],
    ],
    moodEyebrow: "Давайте начнём с простого",
    moodTitle: "Как вы сегодня?",
    moodIntro: "Можно по-разному. Выберите, что ближе сейчас.",
    moods: [
      "Нужна поддержка",
      "Немного устала",
      "Спокойно",
      "Хорошо",
      "Радостно",
    ],
    prompts: [
      "Что могло бы сделать этот день чуть мягче для вас?",
      "От чего можно сегодня отдохнуть, хотя бы на пять минут?",
      "Что помогает вам сохранять это спокойствие?",
      "Какой маленький момент сегодня хочется запомнить?",
      "С кем или с чем хочется разделить эту радость?",
    ],
    promptLabel: "Один бережный вопрос",
    moodAction: "Записать в дневник",
    journeyEyebrow: "Ваше первое маленькое путешествие",
    journeyTitle: "Познакомиться с собой",
    journeyEm: "можно без спешки.",
    steps: [
      [
        "01",
        "Расскажите немного о себе",
        "Имя, дата рождения и то, что сейчас важно. Начните там, где вы есть.",
      ],
      [
        "02",
        "Откройте свою личную карту",
        "Прочитайте расчёт и выберите мысль, которая откликается именно вам.",
      ],
      [
        "03",
        "Оставьте место для себя",
        "Одна заметка, один ритуал, один маленький шаг. В удобное для вас время.",
      ],
    ],
    practicesEyebrow: "Больше глубины, когда вы готовы",
    practicesTitle: "Практики",
    practicesEm: "для вашего внутреннего мира.",
    practicesLink: "Все практики",
    clubEyebrow: "Numerologic Club",
    clubTitle: "Пусть забота о себе",
    clubEm: "станет привычной.",
    clubIntro:
      "Личные разборы, практики и обзор недели. Всё, что помогает замечать себя и возвращаться к важному.",
    clubCta: "Заглянуть в клуб",
    clubPeriod: "за 30 дней · продление по вашему выбору",
    gentleNote: "Числа — повод прислушаться к себе. Вашу историю пишете вы.",
  },
  en: {
    eyebrow: "A little space. A little more care for yourself.",
    title: "A place to",
    titleEm: "hear yourself.",
    intro:
      "Set aside other people's expectations. Make room for your own wishes. Find what supports you through numbers, a private journal and small everyday rituals.",
    start: "Get to know yourself",
    open: "I already have a space",
    free: "7 days free after sign-up · No card needed",
    photo: "A cup of tea, a blank journal and a quiet moment for yourself",
    photoCaption: "your quiet corner",
    cardLabel: "A reminder for today",
    card: "You don't have to do it all.",
    cardSub: "Start with a little time for yourself.",
    ribbon: [
      "At your own pace",
      "Without comparisons",
      "A moment for yourself",
      "A little care every day",
    ],
    toolsEyebrow: "Something to come back to",
    toolsTitle: "Closer to yourself.",
    toolsEm: "Day by day.",
    toolsIntro:
      "Sometimes you need a thoughtful question. Sometimes you need somewhere to let it out. There is room for both here.",
    tools: [
      [
        "flower",
        "Your story in numbers",
        "See familiar parts of yourself with fresh eyes. A personal birth-date chart with clear calculations and questions to reflect on.",
        "Explore your chart",
        "/numbers",
        "rose",
      ],
      [
        "journal",
        "A page just for you",
        "Joys, worries and small discoveries. Write them as they are. Your thoughts can simply be here, without judgement or perfect answers.",
        "Open your journal",
        "/journal",
        "sage",
      ],
      [
        "sun",
        "Your everyday rituals",
        "Five minutes in the morning, a walk or a quiet pause before bed. Choose what feels right and gently find your own rhythm.",
        "Find your ritual",
        "/rituals",
        "butter",
      ],
    ],
    moodEyebrow: "Let's start with something simple",
    moodTitle: "How are you today?",
    moodIntro: "Every feeling has a place. Choose what feels closest.",
    moods: [
      "Need some support",
      "A little tired",
      "Calm",
      "Feeling good",
      "Joyful",
    ],
    prompts: [
      "What could make today a little gentler for you?",
      "What could you step away from, even for five minutes?",
      "What helps you hold on to this calm?",
      "Which little moment would you like to remember?",
      "Who or what would you like to share this joy with?",
    ],
    promptLabel: "One gentle question",
    moodAction: "Write in your journal",
    journeyEyebrow: "Your first little journey",
    journeyTitle: "Getting to know yourself",
    journeyEm: "doesn't have to be a rush.",
    steps: [
      [
        "01",
        "Share a little about yourself",
        "Your name, birth date and what matters right now. Begin where you are.",
      ],
      [
        "02",
        "Open your personal chart",
        "Explore your numbers and choose a thought that speaks to you.",
      ],
      [
        "03",
        "Make a little room for yourself",
        "One note, one ritual, one small step. Whenever it feels right.",
      ],
    ],
    practicesEyebrow: "More depth, when you're ready",
    practicesTitle: "Practices",
    practicesEm: "for your inner world.",
    practicesLink: "All practices",
    clubEyebrow: "Numerologic Club",
    clubTitle: "Let caring for yourself",
    clubEm: "become a familiar feeling.",
    clubIntro:
      "Personal readings, gentle practices and a weekly reflection. Everything to help you notice yourself and return to what matters.",
    clubCta: "Explore the club",
    clubPeriod: "for 30 days · renew when you choose",
    gentleNote:
      "Numbers invite you to listen to yourself. You write your own story.",
  },
};
function MoodFace({ mood, selected }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill={selected ? "#e3b9a3" : "#f0e4d6"} />
      <path
        d="M16 19h.2M31.8 19h.2"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d={
          [
            "M17 31q7-7 14 0",
            "M18 30q6-3 12 0",
            "M18 29h12",
            "M17 27q7 9 14 0",
            "M16 26q8 13 16 0Z",
          ][mood]
        }
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function WarmCalculator({ en }) {
  const id = useId();
  const [date, setDate] = useState("1994-06-18");
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
    ? [...date].reduce(
        (total, digit) => total + (/\d/.test(digit) ? Number(digit) : 0),
        0,
      )
    : null;
  const chain = [sum];
  if (valid)
    while (chain.at(-1) > 9 && ![11, 22, 33].includes(chain.at(-1)))
      chain.push([...String(chain.at(-1))].reduce((a, b) => a + Number(b), 0));
  return (
    <section className="cozy-calculator" aria-labelledby={`${id}-title`}>
      <div>
        <span className="cozy-eyebrow">
          {en
            ? "A little curiosity is a lovely start"
            : "Начать можно с любопытства"}
        </span>
        <h2 id={`${id}-title`}>
          {en ? "Your birth date." : "Ваша дата рождения."}
          <br />
          <em>{en ? "A new way to reflect." : "Новый взгляд на себя."}</em>
        </h2>
        <p>
          {en
            ? "Discover your life path number, then explore the questions it opens. The calculation preserves master numbers 11, 22 and 33."
            : "Узнайте число жизненного пути и посмотрите, какие вопросы оно открывает. В расчёте сохраняются мастер-числа 11, 22 и 33."}
        </p>
      </div>
      <div className="cozy-calculator-card">
        <label htmlFor={id}>{en ? "Date of birth" : "Дата рождения"}</label>
        <input
          id={id}
          type="date"
          min="0001-01-01"
          max={max}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-invalid={!valid}
          aria-describedby={`${id}-note`}
        />
        <div className="cozy-number-result" aria-live="polite">
          <span className="nl-result-number">{number ?? "—"}</span>
          <div>
            <span>
              {en ? "Your life path number" : "Ваше число жизненного пути"}
            </span>
            <small>
              {valid
                ? chain.join(" → ")
                : en
                  ? "Choose a valid birth date"
                  : "Выберите действительную дату"}
            </small>
          </div>
        </div>
        <Link
          className="cozy-text-link"
          to={valid ? `/quiz?birth_date=${encodeURIComponent(date)}` : "/quiz"}
        >
          {en ? "Explore my chart" : "Познакомиться со своей картой"}
          <GentleIcon name="arrow" size={19} />
        </Link>
        <small id={`${id}-note`}>
          {en
            ? "A symbolic prompt for reflection, not a prediction."
            : "Символический повод для размышления, не прогноз."}
        </small>
      </div>
    </section>
  );
}
export default function Home({ variant }) {
  const { language } = useI18n();
  const en = language === "en",
    c = words[en ? "en" : "ru"];
  const [mood, setMood] = useState(2);
  useEffect(() => {
    if (variant) void api.track("landing_view", { variant, source: "landing" });
  }, [variant]);
  const club = products.find((p) => p.slug === "club");
  return (
    <div className="cozy-home">
      <section className="cozy-hero">
        <div className="cozy-hero-copy">
          <span className="cozy-eyebrow">
            <span />
            {c.eyebrow}
          </span>
          <h1>
            {variant === "b"
              ? en
                ? "What could your"
                : "Что расскажут"
              : c.title}
            <br />
            <em>
              {variant === "b"
                ? en
                  ? "numbers tell you?"
                  : "ваши числа?"
                : c.titleEm}
            </em>
          </h1>
          <p>{c.intro}</p>
          <Link className="primary-button cozy-start" to="/quiz">
            {c.start}
            <GentleIcon name="arrow" size={20} />
          </Link>
          <small className="cozy-free">{c.free}</small>
          <Link className="cozy-existing" to="/dashboard">
            {c.open}
            <span aria-hidden="true"> ↗</span>
          </Link>
        </div>
        <div className="cozy-hero-art">
          <img
            className="cozy-morning"
            src={`${import.meta.env.BASE_URL}quiet-morning.webp`}
            alt={c.photo}
            width="1122"
            height="1402"
            fetchPriority="high"
          />
          <span className="cozy-photo-caption">
            {c.photoCaption}
            <GentleIcon name="flower" size={23} />
          </span>
          <div className="cozy-reminder">
            <GentleIcon name="heart" size={25} />
            <span>{c.cardLabel}</span>
            <strong>{c.card}</strong>
            <p>{c.cardSub}</p>
            <span className="cozy-reminder-signature">
              with love, numerologic
            </span>
          </div>
          <span className="cozy-side-note" aria-hidden="true">
            a little closer to yourself
          </span>
        </div>
      </section>
      <div className="cozy-ribbon">
        {c.ribbon.map((text) => (
          <span key={text}>
            <GentleIcon name="flower" size={17} />
            {text}
          </span>
        ))}
      </div>
      <WarmCalculator en={en} />
      <section className="cozy-section" id="home-tools">
        <div className="cozy-heading">
          <span className="cozy-eyebrow">{c.toolsEyebrow}</span>
          <h2>
            {c.toolsTitle}
            <br />
            <em>{c.toolsEm}</em>
          </h2>
          <p>{c.toolsIntro}</p>
        </div>
        <div className="cozy-tools">
          {c.tools.map(([icon, title, body, action, to, tint]) => (
            <Link key={to} to={to} className={`cozy-tool cozy-${tint}`}>
              <span className="cozy-tool-art">
                <GentleIcon name={icon} size={44} />
                <span className="cozy-tool-petal" />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="cozy-tool-action">
                {action}
                <GentleIcon name="arrow" size={20} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="cozy-mood-section" aria-labelledby="cozy-mood-title">
        <div className="cozy-mood-copy">
          <GentleIcon name="leaf" size={36} />
          <span className="cozy-eyebrow">{c.moodEyebrow}</span>
          <h2 id="cozy-mood-title">{c.moodTitle}</h2>
          <p>{c.moodIntro}</p>
        </div>
        <div className="cozy-mood-inner">
          <div className="cozy-moods" role="group" aria-label={c.moodTitle}>
            {c.moods.map((label, i) => (
              <button
                key={label}
                type="button"
                aria-pressed={mood === i}
                onClick={() => setMood(i)}
              >
                <MoodFace mood={i} selected={mood === i} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="cozy-mood-prompt" aria-live="polite">
            <span className="cozy-eyebrow">{c.promptLabel}</span>
            <p>{c.prompts[mood]}</p>
          </div>
          <Link className="cozy-text-link" to={`/journal?mood=${mood + 1}`}>
            {c.moodAction}
            <GentleIcon name="arrow" size={19} />
          </Link>
        </div>
      </section>
      <section className="cozy-section cozy-journey">
        <div className="cozy-heading">
          <span className="cozy-eyebrow">{c.journeyEyebrow}</span>
          <h2>
            {c.journeyTitle}
            <br />
            <em>{c.journeyEm}</em>
          </h2>
        </div>
        <div className="cozy-steps">
          {c.steps.map(([n, title, body]) => (
            <article key={n}>
              <span className="cozy-step-number">{n}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <Link className="secondary-button" to="/quiz">
          {c.start}
          <GentleIcon name="arrow" size={19} />
        </Link>
      </section>
      <section className="cozy-section">
        <div className="cozy-heading cozy-heading-split">
          <div>
            <span className="cozy-eyebrow">{c.practicesEyebrow}</span>
            <h2>
              {c.practicesTitle}
              <br />
              <em>{c.practicesEm}</em>
            </h2>
          </div>
          <Link className="cozy-text-link" to="/practices">
            {c.practicesLink}
            <GentleIcon name="arrow" size={20} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x.category === "practice")
            .slice(0, 3)
            .map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
        </div>
      </section>
      <section className="cozy-club">
        <GentleIcon name="flower" size={52} />
        <span className="cozy-eyebrow">{c.clubEyebrow}</span>
        <h2>
          {c.clubTitle}
          <br />
          <em>{c.clubEm}</em>
        </h2>
        <p>{c.clubIntro}</p>
        <Link className="primary-button" to="/club">
          {c.clubCta}
          <GentleIcon name="arrow" size={20} />
        </Link>
        {club && (
          <small>
            {formatPrice(club.price)} {c.clubPeriod}
          </small>
        )}
      </section>
      <p className="cozy-goodbye">
        <GentleIcon name="heart" size={19} />
        {c.gentleNote}
      </p>
    </div>
  );
}
