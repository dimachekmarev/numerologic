import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";

// Система достижений — психологический крючок
const ACHIEVEMENTS = [
  // Первые шаги
  { id: "first_quiz", icon: "✦", title: "Первый шаг", desc: "Пройти мини-разбор", condition: (d) => d.has_profile },
  { id: "first_entry", icon: "📝", title: "Первая запись", desc: "Записать мысль в дневник", condition: (d) => d.entries >= 1 },
  { id: "first_goal", icon: "🎯", title: "Первый шаг", desc: "Поставить цель", condition: (d) => d.goals_total >= 1 },
  { id: "first_practice", icon: "🧘", title: "Первая практика", desc: "Отметить день практики", condition: (d) => d.practice_days >= 1 },

  // Привычка
  { id: "streak_3", icon: "🔥", title: "3 дня подряд", desc: "Записывать 3 дня подряд", condition: (d) => d.streak >= 3 },
  { id: "streak_7", icon: "⚡", title: "Неделя с собой", desc: "7 дней записей подряд", condition: (d) => d.streak >= 7 },
  { id: "streak_14", icon: "💎", title: "Две недели", desc: "14 дней записей подряд", condition: (d) => d.streak >= 14 },
  { id: "streak_30", icon: "🌟", title: "Месяц осознанности", desc: "30 дней записей подряд", condition: (d) => d.streak >= 30 },

  // Глубина
  { id: "entries_10", icon: "📖", title: "Летописец", desc: "10 записей в дневнике", condition: (d) => d.entries >= 10 },
  { id: "entries_30", icon: "📚", title: "Хранитель мыслей", desc: "30 записей в дневнике", condition: (d) => d.entries >= 30 },
  { id: "entries_100", icon: "🏛", title: "Мудрец", desc: "100 записей в дневнике", condition: (d) => d.entries >= 100 },

  // Практики
  { id: "practice_7", icon: "🌱", title: "Неделя практики", desc: "7 дней упражнений", condition: (d) => d.practice_days >= 7 },
  { id: "practice_complete", icon: "🏆", title: "Практикум пройден", desc: "Завершить полный практикум", condition: (d) => d.practices_completed >= 1 },

  // Цели
  { id: "goals_5", icon: "✨", title: "5 шагов", desc: "Выполнить 5 целей", condition: (d) => d.goals_done >= 5 },
  { id: "goals_20", icon: "🚀", title: "20 шагов", desc: "Выполнить 20 целей", condition: (d) => d.goals_done >= 20 },

  // Клуб
  { id: "club_member", icon: "👑", title: "Участник клуба", desc: "Вступить в клуб", condition: (d) => d.club },
  { id: "trial_used", icon: "🎁", title: "Исследователь", desc: "Активировать пробный период", condition: (d) => d.trial_used },
];

export default function Achievements() {
  const dashboard = useLoad(api.dashboard);
  const week = useLoad(api.weekly);
  const [showAll, setShowAll] = useState(false);

  if (!dashboard.data) return null;

  const d = dashboard.data;
  const w = week.data || {};

  // Формируем данные для проверки достижений
  const data = {
    has_profile: !!d.user?.profile,
    entries: w.entries || 0,
    streak: w.streak || 0,
    goals_total: d.goals?.length || 0,
    goals_done: d.goals?.filter(g => g.done).length || 0,
    practice_days: d.practice_days || 0,
    practices_completed: d.practices_completed || 0,
    club: d.club || false,
    trial_used: d.trial?.used || false,
  };

  const unlocked = ACHIEVEMENTS.filter(a => a.condition(data));
  const locked = ACHIEVEMENTS.filter(a => !a.condition(data));
  const progress = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  // Определяем "уровень"
  const level = unlocked.length < 3 ? "Начинающий" :
                unlocked.length < 7 ? "Исследователь" :
                unlocked.length < 12 ? "Практик" :
                unlocked.length < 16 ? "Мастер" : "Мудрец";

  const nextAchievement = locked[0];

  return (
    <section className="achievements-section">
      <div className="achievements-header">
        <div className="achievements-level">
          <div className="level-badge">
            <span className="level-icon">✦</span>
            <div>
              <small>Ваш уровень</small>
              <strong>{level}</strong>
            </div>
          </div>
          <div className="level-progress">
            <div className="level-progress-bar">
              <i style={{ width: `${progress}%` }} />
            </div>
            <small>{unlocked.length} из {ACHIEVEMENTS.length} достижений</small>
          </div>
        </div>
      </div>

      {/* СЛЕДУЮЩЕЕ ДОСТИЖЕНИЕ — крючок */}
      {nextAchievement && (
        <div className="next-achievement">
          <span className="chip">Следующая цель</span>
          <div className="next-achievement-card">
            <span className="next-achievement-icon">{nextAchievement.icon}</span>
            <div>
              <h4>{nextAchievement.title}</h4>
              <p>{nextAchievement.desc}</p>
            </div>
            <Link className="ghost-button" to={
              nextAchievement.id.includes("entry") ? "/journal" :
              nextAchievement.id.includes("goal") ? "/goals" :
              nextAchievement.id.includes("practice") ? "/practices" :
              nextAchievement.id.includes("streak") ? "/today" :
              "/dashboard"
            }>
              Получить →
            </Link>
          </div>
        </div>
      )}

      {/* ДОСТИЖЕНИЯ */}
      <div className="achievements-grid">
        {(showAll ? ACHIEVEMENTS : [...unlocked, ...locked.slice(0, 4)]).map((a) => {
          const isUnlocked = a.condition(data);
          return (
            <div key={a.id} className={`achievement-card ${isUnlocked ? "unlocked" : "locked"}`}>
              <span className="achievement-icon">{isUnlocked ? a.icon : "🔒"}</span>
              <div>
                <strong>{a.title}</strong>
                <small>{a.desc}</small>
              </div>
            </div>
          );
        })}
      </div>

      {!showAll && ACHIEVEMENTS.length > 8 && (
        <button className="ghost-button achievements-toggle" onClick={() => setShowAll(true)}>
          Показать все {ACHIEVEMENTS.length} достижений →
        </button>
      )}
    </section>
  );
}
