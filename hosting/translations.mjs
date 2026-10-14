import english from "../frontend/src/data/en.json" with { type: "json" };
import nativeEnglish from "../frontend/src/data/en-native.json" with { type: "json" };

// Prepared product copy only. Unknown strings are preserved, never inferred.
const translations = {
  ...english,
  ...nativeEnglish,
  "самонаблюдение": "self-observation",
  "Козерог": "Capricorn",
  "Водолей": "Aquarius",
  "Рыбы": "Pisces",
  "Овен": "Aries",
  "Телец": "Taurus",
  "Близнецы": "Gemini",
  "Рак": "Cancer",
  "Лев": "Leo",
  "Дева": "Virgo",
  "Весы": "Libra",
  "Скорпион": "Scorpio",
  "Стрелец": "Sagittarius",
  "вдохновение и чувствительность": "inspiration and sensitivity",
  "замысел и воплощение": "vision and bringing it to life",
  "поддержка и зрелая забота": "support and thoughtful care",
  "Солнечный знак по календарным границам. Это символическая тема для размышления, не натальная карта и не прогноз.":
    "The sun sign uses calendar date boundaries. It offers a symbolic theme for reflection, without a natal chart or a forecast.",
  "Сумма цифр даты рождения; мастер-числа 11, 22 и 33 сохраняются в карте. Для года, месяца и дня — редукция до 1–9. Русский и латинский алфавиты считаются отдельно, буквы идут по циклу 1–9. Разные школы используют другие методы.":
    "The birth-date digits are added together, preserving master numbers 11, 22, and 33 in the chart. Year, month, and day numbers are reduced to 1–9. Russian and Latin alphabets are calculated separately, assigning letters values in a repeating 1–9 cycle. Other numerology traditions use different methods.",
};

/** Apply to prepared product content, rather than entire user records. */
export function localizeContent(value, language = "ru") {
  if (language !== "en") return value;
  if (typeof value === "string")
    return Object.hasOwn(translations, value) ? translations[value] : value;
  if (Array.isArray(value))
    return value.map((item) => localizeContent(item, language));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        localizeContent(item, language),
      ]),
    );
  return value;
}
