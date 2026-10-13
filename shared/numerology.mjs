export const meanings = {
  1: "инициатива",
  2: "диалог",
  3: "самовыражение",
  4: "порядок",
  5: "гибкость",
  6: "забота",
  7: "наблюдение",
  8: "ресурсы",
  9: "завершение",
  11: "вдохновение и чувствительность",
  22: "замысел и воплощение",
  33: "поддержка и зрелая забота",
};
export function reduceNumber(value, preserveMasters = true) {
  let n = [...String(value)].reduce(
    (sum, c) => sum + (/\d/.test(c) ? Number(c) : 0),
    0,
  );
  while (n > 9 && !(preserveMasters && [11, 22, 33].includes(n)))
    n = [...String(n)].reduce((sum, c) => sum + Number(c), 0);
  return n || 1;
}
export function nameNumber(name, mode = "all") {
  const alphabets = [
      "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
      "abcdefghijklmnopqrstuvwxyz",
    ],
    vowels = "аеёиоуыэюяaeiouy";
  let sum = 0;
  for (const c of name.normalize("NFC").toLowerCase())
    for (const alphabet of alphabets) {
      const i = alphabet.indexOf(c);
      if (
        i >= 0 &&
        (mode === "all" ||
          (mode === "vowels" ? vowels.includes(c) : !vowels.includes(c)))
      )
        sum += (i % 9) + 1;
    }
  return reduceNumber(sum);
}
export function calculateProfile(name, birthDate, targetDate) {
  const born = new Date(birthDate + "T12:00:00Z"),
    target = new Date(targetDate + "T12:00:00Z");
  const life = reduceNumber(birthDate),
    year = reduceNumber(
      born.getUTCDate() + born.getUTCMonth() + 1 + target.getUTCFullYear(),
      false,
    );
  const digits = [...birthDate].filter((c) => /\d/.test(c)).map(Number),
    sum = digits.reduce((a, b) => a + b, 0),
    chain = [sum];
  while (chain.at(-1) > 9 && ![11, 22, 33].includes(chain.at(-1)))
    chain.push([...String(chain.at(-1))].reduce((a, c) => a + Number(c), 0));
  return {
    name,
    birth_date: birthDate,
    life_path: life,
    base_path: reduceNumber(life, false),
    destiny: nameNumber(name),
    soul: nameNumber(name, "vowels"),
    personality: nameNumber(name, "consonants"),
    birthday: reduceNumber(born.getUTCDate()),
    year,
    month: reduceNumber(year + target.getUTCMonth() + 1, false),
    meaning: meanings[life],
    arithmetic: digits.join(" + ") + " = " + chain.join(" → "),
    system:
      "Сумма цифр даты рождения; мастер-числа 11, 22 и 33 сохраняются в карте. Для года, месяца и дня — редукция до 1–9. Русский и латинский алфавиты считаются отдельно, буквы идут по циклу 1–9. Разные школы используют другие методы.",
  };
}
