import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";

// Персонализированные рекомендации на основе поведения
const RECOMMENDATIONS = {
  no_entries: {
    icon: "📝",
    title: "Запишите первую мысль",
    desc: "2 минуты. Без цензуры. Просто что чувствуете прямо сейчас.",
    cta: "Открыть дневник",
    to: "/journal",
    weight: 10,
  },
  low_mood: {
    icon: "🫂",
    title: "Сегодня тяжело? Это нормально.",
    desc: "Попробуйте практику границ — один маленький отказ без вины.",
    cta: "Практика границ",
    to: "/practices/boundaries",
    weight: 9,
  },
  no_goals: {
    icon: "🎯",
    title: "Какой один шаг вы можете сделать сегодня?",
    desc: "Не план на год. Один посильный шаг, который зависит от вас.",
    cta: "Поставить цель",
    to: "/goals",
    weight: 7,
  },
  streak_broken: {
    icon: "🔄",
    title: "Не страшно, что пропустили.",
    desc: "Важно не совершенство, а возвращение. Запишите одну мысль.",
    cta: "Вернуться к себе",
    to: "/journal",
    weight: 10,
  },
  practice_available: {
    icon: "🧘",
    title: "Новый день практики ждёт",
    desc: "3 минуты упражнения. Отметьте выполнение — и завтра следующий шаг.",
    cta: "Продолжить практику",
    to: "/practices",
    weight: 8,
  },
  weekly_review: {
    icon: "📊",
    title: "Ваш обзор недели готов",
    desc: "Посмотрите, что помогало на этой неделе. Выберите один инсайт.",
    cta: "Мой обзор",
    to: "/weekly",
    weight: 6,
  },
  ai_context: {
    icon: "🤖",
    title: "Спросите помощника",
    desc: "AI помнит ваши записи и задаст точный вопрос для размышления.",
    cta: "Задать вопрос",
    to: "/assistant",
    weight: 5,
  },
  numbers_update: {
    icon: "✦",
    title: "Ваше число месяца обновилось",
    desc: "Новый период — новый фокус. Посмотрите, что важно сейчас.",
    cta: "Моя карта",
    to: "/numbers",
    weight: 4,
  },
};

export default function DailyRitual() {
  const dashboard = useLoad(api.dashboard);
  const week = useLoad(api.weekly);
  const today = useLoad(api.today);
  const [notified, setNotified] = useState(false);
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  async function requestNotification() {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        new Notification("Numerologic", {
          body: "Мы напомним вам о теме дня. Без спама — одно сообщение утром.",
          icon: "/favicon.svg",
        });
      }
    }
  }

  if (!dashboard.data || !week.data) return null;

  const d = dashboard.data;
  const w = week.data;
  const t = today.data;

  // Анализируем поведение и выбираем рекомендацию
  const recommendations = [];

  if (w.entries === 0) {
    recommendations.push(RECOMMENDATIONS.no_entries);
  }
  if (w.streak === 0 && d.user?.profile) {
    recommendations.push(RECOMMENDATIONS.streak_broken);
  }
  if (!d.goals || d.goals.filter(g => !g.done).length === 0) {
    recommendations.push(RECOMMENDATIONS.no_goals);
  }
  if (w.average_mood && w.average_mood <= 2) {
    recommendations.push(RECOMMENDATIONS.low_mood);
  }
  if (d.club || d.trial?.active) {
    recommendations.push(RECOMMENDATIONS.practice_available);
    recommendations.push(RECOMMENDATIONS.ai_context);
  }

  // День недели для обзора
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    recommendations.push(RECOMMENDATIONS.weekly_review);
  }

  // 1-е число месяца
  if (new Date().getDate() === 1) {
    recommendations.push(RECOMMENDATIONS.numbers_update);
  }

  // Сортируем по весу и берём топ-2
  recommendations.sort((a, b) => b.weight - a.weight);
  const top = recommendations.slice(0, 2);

  // Если нет рекомендаций — показываем тему дня
  if (top.length === 0 && t) {
    top.push({
      icon: "☀️",
      title: `Тема дня: ${t.theme}`,
      desc: t.practice,
      cta: "Мой день",
      to: "/today",
    });
  }

  return (
    <section className="daily-ritual">
      {/* PUSH NOTIFICATIONS */}
      {permission === "default" && (
        <div className="ritual-notification soft-card">
          <span className="ritual-notification-icon">🔔</span>
          <div>
            <strong>Напоминать о теме дня?</strong>
            <small>Одно сообщение утром. Без спама. Можно отключить.</small>
          </div>
          <button className="primary-button" onClick={requestNotification}>
            Включить
          </button>
        </div>
      )}

      {/* ПЕРСОНАЛИЗИРОВАННЫЕ РЕКОМЕНДАЦИИ */}
      {top.length > 0 && (
        <div className="ritual-recommendations">
          <span className="eyebrow">Для вас сегодня</span>
          <div className="ritual-cards">
            {top.map((rec, i) => (
              <Link to={rec.to} className="soft-card ritual-card" key={i}>
                <span className="ritual-card-icon">{rec.icon}</span>
                <div>
                  <h4>{rec.title}</h4>
                  <p>{rec.desc}</p>
                </div>
                <span className="ritual-card-cta">{rec.cta} →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* СТРИК — потеря если уйдёт */}
      {w.streak >= 3 && (
        <div className="ritual-streak-reminder">
          <span className="streak-fire">🔥</span>
          <div>
            <strong>{w.streak} дней подряд!</strong>
            <small>Не прерывайте — запишите хотя бы одну мысль сегодня.</small>
          </div>
          <Link className="ghost-button" to="/journal">
            Записать →
          </Link>
        </div>
      )}
    </section>
  );
}
