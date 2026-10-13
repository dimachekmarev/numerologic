export function weekSummary(entries, goals, progress, day) {
  const start = new Date(day + "T12:00:00Z");
  start.setUTCDate(start.getUTCDate() - 6);
  const since = start.toISOString().slice(0, 10),
    week = entries.filter((e) => e.day >= since && e.day <= day),
    counts = {};
  for (const e of week) counts[e.mood] = (counts[e.mood] || 0) + 1;
  let streak = 0,
    cursor = new Date(day + "T12:00:00Z");
  if (!entries.some((e) => e.day === day))
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (entries.some((e) => e.day === cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return {
    since,
    until: day,
    entries: week.length,
    steps: week.filter((e) => e.done).length,
    average_mood: week.length
      ? Math.round((week.reduce((a, e) => a + e.mood, 0) / week.length) * 10) /
        10
      : null,
    streak,
    goals_done: goals.filter((g) => g.done && g.due >= since && g.due <= day)
      .length,
    practice_steps: progress.length,
    moods: Array.from({ length: 5 }, (_, i) => counts[i + 1] || 0),
    question: week.length
      ? "Какой маленький шаг поддерживал вас на этой неделе?"
      : "Начните с одной записи: что сейчас занимает ваши мысли?",
  };
}
export function guidedReflection(focus, entries, goals) {
  const options = {
    boundaries: {
      question: "В какой конкретной ситуации вы хотите сказать «нет»?",
      exercise:
        "Запишите одну просьбу, на которую вы не готовы согласиться. Составьте фразу: «Сейчас я не могу ___. Могу предложить ___». Прочитайте её вслух.",
      prompt: "Мой спокойный отказ: ",
      practice: "boundaries",
    },
    clarity: {
      question: "Какую одну мысль хочется прояснить?",
      exercise:
        "За пять минут запишите всё, что занимает голову. Отметьте одну вещь, на которую можете повлиять сегодня. Выберите действие на десять минут.",
      prompt: "Меня занимает ___. Сегодня я могу: ",
      practice: "clarity",
    },
    dialogue: {
      question: "Какую просьбу хочется обсудить спокойно?",
      exercise:
        "Отделите наблюдение от оценки. Напишите: «Когда происходит ___, я чувствую ___. Мне важно ___. Можем ли мы ___?»",
      prompt: "Моя просьба: ",
      practice: "relationship-dialogue",
    },
    focus: {
      question: "Какое дело вы хотите сдвинуть с места?",
      exercise:
        "Уменьшите задачу до первого действия на пять минут. Подготовьте нужный инструмент, поставьте таймер и сделайте только этот шаг.",
      prompt: "Первое действие на пять минут: ",
      practice: "gentle-focus",
    },
  };
  const item = options[focus];
  if (!item) return null;
  const last = entries.at(0),
    goal = goals.find((g) => !g.done);
  return {
    mode: "guided",
    ...item,
    context: last
      ? `Последняя запись — ${last.day}. Сравните это упражнение со своими наблюдениями.`
      : "После упражнения сохраните наблюдение в дневнике.",
    next_goal: goal?.title || null,
  };
}
