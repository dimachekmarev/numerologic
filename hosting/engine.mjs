import symbolic from "./symbolic.json" with { type: "json" };
import library from "../backend/library.json" with { type: "json" };
import {
  meanings,
  calculateProfile,
  reduceNumber,
} from "../shared/numerology.mjs";
export { library };
export { meanings };
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
export function reportContent(customer, slug, partner = null) {
  const { name, birth_date: b, focus } = customer,
    p = profile(name, b);
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

export function mapContent(user) {
  const p = profile(user.name, user.birth_date);
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
