import symbolic from "./symbolic.json" with { type: "json" };
import library from "../backend/library.json" with { type: "json" };
import { localizeContent } from "./translations.mjs";
import {
  meanings,
  calculateProfile,
  reduceNumber,
} from "../shared/numerology.mjs";
export { library };
export { meanings };
export { localizeContent };
export const { practices, tarot } = symbolic;
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function fail(status, detail) {
  const e = new Error(detail);
  e.status = status;
  throw e;
}
export function text(value, min = 1, max = 128) {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.length > max
  )
    fail(422, `Введите текст длиной от ${min} до ${max} символов`);
  return value.trim();
}
export function date(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  )
    fail(422, "Укажите существующую дату в формате ГГГГ-ММ-ДД");
  return value;
}
export function birth(value) {
  date(value);
  if (value < "1900-01-01" || value > today())
    fail(422, "Дата рождения должна быть между 1900 годом и сегодняшним днём");
  return value;
}
export const reduce = (value) => reduceNumber(value, false);
export function profile(name, b, d = today()) {
  birth(b);
  date(d);
  return calculateProfile(name, b, d);
}
export function zodiac(b) {
  const mmdd = Number(b.slice(5, 7)) * 100 + Number(b.slice(8));
  return [
    [120, "Козерог"],
    [219, "Водолей"],
    [321, "Рыбы"],
    [420, "Овен"],
    [521, "Телец"],
    [621, "Близнецы"],
    [723, "Рак"],
    [823, "Лев"],
    [923, "Дева"],
    [1023, "Весы"],
    [1122, "Скорпион"],
    [1222, "Стрелец"],
    [1232, "Козерог"],
  ].find(([v]) => mmdd < v)[1];
}
export async function digest(value) {
  const result = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(result)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
export async function daily(user, d = today()) {
  if (!user.birth_date) fail(422, "Сначала заполните профиль");
  const p = profile(user.name, user.birth_date, d),
    n = reduce(p.month + Number(d.slice(8))),
    c =
      tarot[
        Number(
          BigInt("0x" + (await digest(`${user.id}:${d}`))) %
            BigInt(tarot.length),
        )
      ];
  return {
    date: d,
    number: n,
    theme: meanings[n],
    practice: practices[n],
    tarot: { name: c[0], theme: c[1], question: c[2] },
    zodiac: zodiac(user.birth_date),
    astrology_note:
      "Солнечный знак по календарным границам. Это символическая тема для размышления, не натальная карта и не прогноз.",
    profile: p,
  };
}
export function reportContent(customer, slug, partner = null, language = "ru") {
  const { name, birth_date: b, focus } = customer,
    p = profile(name, b);
  if (language === "en") return englishReport(customer, slug, partner, p);
  if (library[slug])
    return [
      `NUMEROLOGIC · Практикум для ${name}`,
      "Самостоятельные упражнения для самонаблюдения. Это не психотерапия. Выбирайте безопасные ситуации и удобный темп.",
      ...library[slug].map(
        (v, i) => `День ${i + 1}. ${v[0]}\n${v[1]}\nВ дневник: ${v[2]}`,
      ),
      "Отмечайте прогресс в разделе «Практики». Повторение и паузы допустимы.",
    ].join("\n\n");
  const parts = [
    `NUMEROLOGIC · ${name}`,
    `Запрос: ${focus || "самонаблюдение"}`,
    `Метод\n${p.system}\nДата: ${p.arithmetic}`,
    `Карта чисел\nПуть: ${p.life_path} — ${meanings[p.life_path]}.\nИмя: ${p.destiny}. Гласные: ${p.soul}. Согласные: ${p.personality}.\nЭти темы — вопросы для размышления, а не утверждения о личности.`,
  ];
  if (["compatibility", "love-scenario", "deep-reading"].includes(slug)) {
    let t =
      "Отношения\nНазовите по одной потребности каждого. Согласуйте время разговора без телефона. Запишите, какие границы помогают вам чувствовать себя спокойно.\nВопросы: чего я ожидаю молча? Что могу попросить прямо? Как мы поймём, что договорённость работает?";
    if (partner) {
      const q = profile(partner.name, partner.birth_date);
      t += `\nКарта партнёра: ${partner.name}, путь ${q.life_path} (${meanings[q.life_path]}). Общая тема: ${meanings[reduce(p.life_path + q.life_path)]}.\nРасчёт партнёра: ${q.arithmetic}. Числа не измеряют качество отношений.`;
    }
    parts.push(t);
  }
  if (["money-realization", "deep-reading"].includes(slug))
    parts.push(
      "Работа и ресурсы\nОтделите задачи, которые вы контролируете, от внешних обстоятельств. Запишите три навыка и один конкретный пример их применения. Выберите проверяемый шаг: разговор, черновик, завершение задачи.\nВопросы: что забирает время? Какую помощь я могу попросить? Числа не используются для инвестиций, цен или прогноза дохода.",
    );
  if (["life-period", "year-forecast", "deep-reading", "club"].includes(slug))
    parts.push(
      `Календарь тем\nЛичный год: ${p.year}\n` +
        (slug === "year-forecast"
          ? Array.from({ length: 12 }, (_, i) => i + 1)
          : [Number(today().slice(5, 7))]
        )
          .map(
            (m) =>
              `Месяц ${m}: ${meanings[reduce(p.year + m)]}. ${practices[reduce(p.year + m)]}`,
          )
          .join("\n") +
        "\nДаты не обозначают удачу или риск. Планируйте по реальным обстоятельствам.",
    );
  parts.push(
    "План на семь дней\n" +
      Array.from(
        { length: 7 },
        (_, i) => `${i + 1}. ${practices[reduce(p.life_path + i)]}`,
      ).join("\n"),
    "Итог недели\nЧто получилось? Что я узнала или узнал? Какой шаг хочу повторить? Сохраните ответы в дневнике.\nСервис предназначен для развлечения и саморефлексии. Он не предсказывает события и не заменяет профессиональные консультации.",
  );
  return parts.join("\n\n");
}

export function mapContent(user, language = "ru") {
  const p = profile(user.name, user.birth_date);
  if (language === "en") {
    const meaning = (number) => localizeContent(meanings[number], "en");
    return [
      `NUMEROLOGIC · Numerology chart for ${user.name}`,
      `Method\n${localizeContent(p.system, "en")}`,
      `Birth-date calculation\n${p.arithmetic}`,
      `Life path: ${p.life_path} — ${meaning(p.life_path)}`,
      `Name number: ${p.destiny} — ${meaning(p.destiny)}\nInner priorities: ${p.soul} — ${meaning(p.soul)}\nOutward expression: ${p.personality} — ${meaning(p.personality)}\nBirth day: ${p.birthday} — ${meaning(p.birthday)}`,
      `Personal year: ${p.year} — ${meaning(p.year)}\nPersonal month: ${p.month} — ${meaning(p.month)}`,
      "Reflection prompt\nWhich of these themes resonates with you right now? Write down one example from your life and one small next step.",
      "These symbolic themes offer prompts for self-reflection. They do not describe your character or predict events. Full themed reports and guided courses are available separately.",
    ].join("\n\n");
  }
  return [
    `NUMEROLOGIC · Карта чисел для ${user.name}`,
    `Метод\n${p.system}`,
    `Расчёт даты\n${p.arithmetic}`,
    `Жизненный путь: ${p.life_path} — ${p.meaning}`,
    `Число имени: ${p.destiny} — ${meanings[p.destiny]}\nВнутренний запрос: ${p.soul} — ${meanings[p.soul]}\nВнешнее выражение: ${p.personality} — ${meanings[p.personality]}\nДень рождения: ${p.birthday} — ${meanings[p.birthday]}`,
    `Личный год: ${p.year} — ${meanings[p.year]}\nЛичный месяц: ${p.month} — ${meanings[p.month]}`,
    `Вопрос для наблюдения\nКакая из этих тем отзывается сейчас? Запишите один пример из своей жизни и один небольшой шаг.`,
    `Это символические темы для саморефлексии, а не описание характера или предсказание. Полные тематические материалы и практикумы доступны отдельно.`,
  ].join("\n\n");
}

function englishReport(customer, slug, partner, p) {
  const { name, focus } = customer;
  const translate = (value) => localizeContent(value, "en");
  const meaning = (number) => translate(meanings[number]);
  const practice = (number) => translate(practices[number]);
  if (library[slug])
    return [
      `NUMEROLOGIC · Guided course for ${name}`,
      "Self-guided exercises for self-observation. These exercises do not provide psychotherapy. Choose safe situations and a pace that suits you.",
      ...library[slug].map(
        (entry, index) =>
          `Day ${index + 1}. ${translate(entry[0])}\n${translate(entry[1])}\nJournal prompt: ${translate(entry[2])}`,
      ),
      "Track your progress in Practices. You can repeat exercises and take breaks.",
    ].join("\n\n");
  const parts = [
    `NUMEROLOGIC · ${name}`,
    `Focus: ${focus ? translate(focus) : "self-observation"}`,
    `Method\n${translate(p.system)}\nBirth date: ${p.arithmetic}`,
    `Numerology chart\nLife path: ${p.life_path} — ${meaning(p.life_path)}.\nName: ${p.destiny}. Vowels: ${p.soul}. Consonants: ${p.personality}.\nThese themes offer questions for reflection. They make no claims about your personality.`,
  ];
  if (["compatibility", "love-scenario", "deep-reading"].includes(slug)) {
    let section =
      "Relationships\nName one need each. Agree on a time to talk without phones. Note which boundaries help you feel comfortable.\nQuestions: What am I expecting without saying it? What can I ask for directly? How will we know our agreement is working?";
    if (partner) {
      const q = profile(partner.name, partner.birth_date);
      section += `\nPartner’s chart: ${partner.name}, life path ${q.life_path} (${meaning(q.life_path)}). Shared theme: ${meaning(reduce(p.life_path + q.life_path))}.\nPartner’s calculation: ${q.arithmetic}. Numbers do not measure the quality of a relationship.`;
    }
    parts.push(section);
  }
  if (["money-realization", "deep-reading"].includes(slug))
    parts.push(
      "Work and resources\nSeparate tasks you control from external circumstances. Write down three skills and one specific example of using them. Choose a step you can verify, such as having a conversation, writing a draft, or completing a task.\nQuestions: What takes up my time? What help can I ask for? Numbers are not used to guide investments, set prices, or predict income.",
    );
  if (["life-period", "year-forecast", "deep-reading", "club"].includes(slug))
    parts.push(
      `Theme calendar\nPersonal year: ${p.year}\n` +
        (slug === "year-forecast"
          ? Array.from({ length: 12 }, (_, index) => index + 1)
          : [Number(today().slice(5, 7))]
        )
          .map((month) => {
            const number = reduce(p.year + month);
            return `Month ${month}: ${meaning(number)}. ${practice(number)}`;
          })
          .join("\n") +
        "\nDates do not indicate luck or risk. Plan around your actual circumstances.",
    );
  parts.push(
    "Seven-day plan\n" +
      Array.from(
        { length: 7 },
        (_, index) => `${index + 1}. ${practice(reduce(p.life_path + index))}`,
      ).join("\n"),
    "Weekly reflection\nWhat worked? What did I learn? Which step would I like to repeat? Save your answers in your journal.\nThis service is for entertainment and self-reflection. It does not predict events or replace professional advice.",
  );
  return parts.join("\n\n");
}
