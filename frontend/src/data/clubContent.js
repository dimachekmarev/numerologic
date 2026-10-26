// Контент-план клуба на 12 месяцев
// Каждая неделя — новый материал, практика или медитация

export const CLUB_CONTENT = {
  // МЕСЯЦ 1: ОСНОВЫ
  month_1: {
    theme: "Знакомство с собой",
    weeks: [
      {
        week: 1,
        title: "Карта вашего ритма",
        type: "practice",
        desc: "Как читать свою нумерологическую карту и использовать её в повседневной жизни.",
        materials: ["video_5min", "pdf_guide", "daily_questions"],
      },
      {
        week: 2,
        title: "Утренняя настройка",
        type: "meditation",
        desc: "5-минутная медитация для начала дня. Аудио + текст.",
        materials: ["audio_5min", "script_pdf"],
      },
      {
        week: 3,
        title: "Вечерняя рефлексия",
        type: "practice",
        desc: "3 вопроса перед сном, которые меняют качество сна и утра.",
        materials: ["cards_pdf", "audio_guide"],
      },
      {
        week: 4,
        title: "Ваш первый обзор",
        type: "workshop",
        desc: "Как читать свой недельный обзор и извлекать инсайты.",
        materials: ["video_10min", "worksheet_pdf"],
      },
    ],
  },

  // МЕСЯЦ 2: ГРАНИЦЫ
  month_2: {
    theme: "Личные границы",
    weeks: [
      {
        week: 5,
        title: "Что такое здоровые границы",
        type: "course",
        desc: "Психологическая база: почему границы — это не эгоизм.",
        materials: ["article", "quiz", "examples_pdf"],
      },
      {
        week: 6,
        title: "Скрипты отказов",
        type: "practice",
        desc: "15 готовых фраз для сложных ситуаций. Работа, семья, друзья.",
        materials: ["scripts_pdf", "audio_examples"],
      },
      {
        week: 7,
        title: "Границы в отношениях",
        type: "workshop",
        desc: "Как говорить о границах с партнёром без ссор.",
        materials: ["video_15min", "dialogue_cards"],
      },
      {
        week: 8,
        title: "Границы с собой",
        type: "practice",
        desc: "Самодисциплина без самонасилия. Мягкие обязательства.",
        materials: ["guide_pdf", "tracker_pdf"],
      },
    ],
  },

  // МЕСЯЦ 3: ЯСНОСТЬ
  month_3: {
    theme: "Ясность мышления",
    weeks: [
      {
        week: 9,
        title: "Ментальная разгрузка",
        type: "practice",
        desc: "Техника brain dump: выгрузить всё из головы за 10 минут.",
        materials: ["template_pdf", "audio_guide"],
      },
      {
        week: 10,
        title: "Приоритеты без стресса",
        type: "workshop",
        desc: "Матрица Эйзенхауэра для саморефлексии, не продуктивности.",
        materials: ["video_10min", "worksheet_pdf"],
      },
      {
        week: 11,
        title: "Принятие решений",
        type: "practice",
        desc: "5 вопросов перед важным решением. Чек-лист.",
        materials: ["checklist_pdf", "examples"],
      },
      {
        week: 12,
        title: "Квартальный обзор",
        type: "workshop",
        desc: "Ретроспектива 3 месяцев: что сработало, что нет.",
        materials: ["template_pdf", "video_20min"],
      },
    ],
  },

  // МЕСЯЦ 4: ОТНОШЕНИЯ
  month_4: {
    theme: "Глубокие связи",
    weeks: [
      { week: 13, title: "Язык любви", type: "course", desc: "5 языков любви в контексте саморефлексии.", materials: ["quiz", "guide_pdf"] },
      { week: 14, title: "Активное слушание", type: "practice", desc: "3 минуты настоящего слушания без советов.", materials: ["audio_guide", "cards_pdf"] },
      { week: 15, title: "Конфликты как рост", type: "workshop", desc: "Как спорить конструктивно.", materials: ["video_15min", "scripts_pdf"] },
      { week: 16, title: "Благодарность", type: "practice", desc: "Практика благодарности без токсичного позитива.", materials: ["journal_template", "examples"] },
    ],
  },

  // МЕСЯЦ 5: ЭНЕРГИЯ
  month_5: {
    theme: "Ресурс и энергия",
    weeks: [
      { week: 17, title: "Аудит энергии", type: "practice", desc: "Что забирает и что даёт энергию. Карта.", materials: ["worksheet_pdf", "tracker"] },
      { week: 18, title: "Отдых без вины", type: "course", desc: "7 видов отдыха. Какой нужен вам?", materials: ["quiz", "guide_pdf"] },
      { week: 19, title: "Утренние ритуалы", type: "practice", desc: "5 вариантов утра под разное состояние.", materials: ["cards_pdf", "audio_guides"] },
      { week: 20, title: "Вечерние ритуалы", type: "practice", desc: "Подготовка ко сну для качества отдыха.", materials: ["checklist_pdf", "audio_relax"] },
    ],
  },

  // МЕСЯЦ 6: ЦЕЛИ
  month_6: {
    theme: "Осознанные цели",
    weeks: [
      { week: 21, title: "Цели vs желания", type: "course", desc: "Разница между навязанными и своими целями.", materials: ["article", "worksheet_pdf"] },
      { week: 22, title: "Маленькие шаги", type: "practice", desc: "Декомпозиция без перегруза.", materials: ["template_pdf", "examples"] },
      { week: 23, title: "Привычки", type: "workshop", desc: "Как формировать привычки без силы воли.", materials: ["video_15min", "tracker_pdf"] },
      { week: 24, title: "Полугодовой обзор", type: "workshop", desc: "Что изменилось за 6 месяцев.", materials: ["template_pdf", "video_20min"] },
    ],
  },

  // МЕСЯЦ 7-12: ПРОДВИНУТЫЕ ТЕМЫ
  month_7: { theme: "Работа и призвание", weeks: [] },
  month_8: { theme: "Деньги и ценности", weeks: [] },
  month_9: { theme: "Тело и ощущения", weeks: [] },
  month_10: { theme: "Творчество и игра", weeks: [] },
  month_11: { theme: "Прощение и отпускание", weeks: [] },
  month_12: { theme: "Годовой обзор и планирование", weeks: [] },
};

// Эксклюзивные материалы клуба
export const CLUB_EXCLUSIVES = [
  {
    type: "meditation",
    title: "Утренняя медитация 'Ясность'",
    duration: "5 мин",
    icon: "🧘",
  },
  {
    type: "meditation",
    title: "Вечерняя медитация 'Покой'",
    duration: "7 мин",
    icon: "🌙",
  },
  {
    type: "audio",
    title: "Аудио-дневник с вопросами",
    duration: "10 мин",
    icon: "🎙",
  },
  {
    type: "template",
    title: "Еженедельный планировщик",
    format: "PDF",
    icon: "📋",
  },
  {
    type: "template",
    title: "Карта эмоций",
    format: "PDF",
    icon: "🗺",
  },
  {
    type: "course",
    title: "Основы саморефлексии",
    lessons: 7,
    icon: "📚",
  },
];

// Еженедельные live-сессии (будущее)
export const CLUB_LIVE = {
  title: "Еженедельные встречи",
  desc: "Групповые сессии с экспертами по саморефлексии",
  schedule: "Каждую среду, 20:00 МСК",
  format: "Zoom + запись",
};

// Цены для разных рынков
export const CLUB_PRICING = {
  RU: {
    monthly: 990,
    quarterly: 2490, // скидка 16%
    yearly: 7990, // скидка 33%
    currency: "₽",
  },
  US: {
    monthly: 9.99,
    quarterly: 24.99,
    yearly: 79.99,
    currency: "$",
  },
  EU: {
    monthly: 8.99,
    quarterly: 22.99,
    yearly: 69.99,
    currency: "€",
  },
};
