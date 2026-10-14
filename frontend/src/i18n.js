import { createContext, useContext } from "react";
import en from "./data/en.json";
import native from "./data/en-native.json";
const english = { ...en, ...native };
for (const [key, value] of Object.entries(en)) {
  if (key.includes("1 000"))
    english[key.replaceAll("1 000", "1 190")] = value
      .replaceAll("1,000", "1,190")
      .replaceAll("1 000", "1 190");
}
Object.assign(english, {
  Ритуалы: "Rituals",
  Маркетинг: "Marketing",
  "Мои ритуалы и месяц": "My rituals and month",
  Шаг: "Step",
  из: "of",
  Гость: "Guest",
  "Вдохновение и чувствительность": "Inspiration and sensitivity",
  "вдохновение и чувствительность": "inspiration and sensitivity",
  "замысел и воплощение": "vision and implementation",
  "поддержка и зрелая забота": "support and thoughtful care",
  "30 дней для себя": "30 days for yourself",
  "Личный маршрут наблюдений, границ и небольших действий.":
    "A personal route through observations, boundaries and small actions.",
  "30 дней": "30 days",
  "30 пошаговых упражнений": "30 guided exercises",
  "Прогресс в личном кабинете": "Progress saved in your personal space",
  "PDF с полным маршрутом": "PDF with the complete route",
  "Паузы и собственный темп": "Breaks and your own pace",
});
export const Context = createContext(null);
export function translate(value, language = "ru") {
  if (language !== "en" || typeof value !== "string") return value;
  if (english[value]) return english[value];
  const normalized = value.replace(/\s+/g, " ").trim();
  if (english[normalized]) return english[normalized];
  const patterns = [
    [/^Здравствуйте, (.+)\.$/, "Hello, $1."],
    [/^(.+), ваша тема — (.+)$/, "$1, your theme is $2"],
    [/^Доступ до (.+)\.$/, "Access until $1."],
    [/^(\d+) из (\d+) отмечено$/, "$1 of $2 completed"],
    [/^Шаг (\d+) из (\d+)$/, "Step $1 of $2"],
    [
      /^Введите текст длиной от (\d+) до (\d+) символов$/,
      "Enter $1 to $2 characters",
    ],
    [
      /^Лимит: (\d+) сообщений в день.*$/,
      "Daily limit: $1 messages. Please return tomorrow.",
    ],
  ];
  for (const [pattern, replacement] of patterns)
    if (pattern.test(value)) return value.replace(pattern, replacement);
  return value;
}
export function useI18n() {
  return (
    useContext(Context) || {
      language: "ru",
      setLanguage: () => {},
      t: (v) => v,
    }
  );
}
