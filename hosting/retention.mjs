export function habitStats(habit, marks, day) {
  const dates = new Set(
    marks.filter((m) => m.habit_id === habit.id).map((m) => m.day),
  );
  let cursor = new Date(day + "T12:00:00Z"),
    streak = 0;
  const scheduled = (d) => habit.days.includes(d.getUTCDay());
  if (scheduled(cursor) && !dates.has(day))
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (cursor.toISOString().slice(0, 10) >= habit.created) {
    const key = cursor.toISOString().slice(0, 10);
    if (scheduled(cursor)) {
      if (!dates.has(key)) break;
      streak++;
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(day + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 6 + i);
    const key = d.toISOString().slice(0, 10);
    return {
      day: key,
      planned: scheduled(d) && key >= habit.created,
      done: dates.has(key),
    };
  });
  return {
    ...habit,
    streak,
    today_done: dates.has(day),
    today_planned: scheduled(new Date(day + "T12:00:00Z")),
    completed_total: dates.size,
    week,
  };
}
export function monthlyStats(entries, goals, marks, month) {
  const rows = entries.filter((e) => e.day.startsWith(month));
  return {
    month,
    entries: rows.length,
    diary_steps: rows.filter((e) => e.done).length,
    average_mood: rows.length
      ? Math.round((rows.reduce((n, e) => n + e.mood, 0) / rows.length) * 10) /
        10
      : null,
    goals_done: goals.filter((g) => g.done && g.due.startsWith(month)).length,
    habit_marks: marks.filter((m) => m.day.startsWith(month)).length,
    first_day: rows.map((e) => e.day).sort()[0] || null,
    last_day:
      rows
        .map((e) => e.day)
        .sort()
        .at(-1) || null,
  };
}
export function calendarReminder(hour, minute) {
  const h = String(hour).padStart(2, "0"),
    m = String(minute).padStart(2, "0");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Numerologic//Daily Ritual//EN",
    "BEGIN:VEVENT",
    "UID:numerologic-daily-ritual",
    "DTSTART:20260101T" + h + m + "00",
    "DURATION:PT5M",
    "RRULE:FREQ=DAILY",
    "SUMMARY:Numerologic: five minutes for yourself",
    "DESCRIPTION:Open your journal and choose one small step.",
    "BEGIN:VALARM",
    "TRIGGER:PT0M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Your Numerologic ritual",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
