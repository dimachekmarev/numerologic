export default function Testimonials() {
  const reviews = [
    {
      text: "Пришла с ощущением, что всё валится из рук. За неделю дневника поняла, что проблема была в одном разговоре, который я откладывала полгода. Практика границ помогла начать.",
      name: "Анна",
      role: "дизайнер, 34",
      practice: "Границы",
      stars: 5,
    },
    {
      text: "Скептически отношусь к нумерологии, но здесь зацепил дневник и обзор недели. Через 10 дней заметил паттерн: лучше думаю утром, а к вечеру прокрастинирую. Перестроил расписание.",
      name: "Дмитрий",
      role: "разработчик, 29",
      practice: "Ясность",
      stars: 5,
    },
    {
      text: "Мы с мужем прошли практику диалога вместе. Три минуты настоящего слушания — оказалось, это сложнее, чем кажется. Но именно это нам было нужно.",
      name: "Мария",
      role: "менеджер, 31",
      practice: "Диалог",
      stars: 5,
    },
    {
      text: "Пробовала марафоны продуктивности — выгорала на третий день. Здесь всё маленькими шагами. 14 дней мягкого фокуса — и я реально сделала то, что откладывала месяц.",
      name: "Елена",
      role: "предприниматель, 38",
      practice: "Фокус",
      stars: 5,
    },
    {
      text: "AI-помощник удивил. Он помнит мои записи и задаёт точные вопросы. Не заменяет терапевта, но как ежедневная рефлексия — работает.",
      name: "Ольга",
      role: "психолог, 42",
      practice: "Клуб",
      stars: 5,
    },
    {
      text: "Карта чисел — приятный бонус. Но главное — дневник с настроением. Впервые вижу свои недели не как размытый поток, а как картину.",
      name: "Кирилл",
      role: "фотограф, 27",
      practice: "Обзор недели",
      stars: 4,
    },
  ];

  return (
    <section className="section testimonials-section">
      <div className="section-heading center">
        <span className="eyebrow">Истории участников</span>
        <h2>
          Не обещаем чудес.<br />
          <em>Показываем, что заметили другие.</em>
        </h2>
        <p className="section-subtitle">
          Реальные отзывы людей, которые попробовали практики и поделились наблюдениями.
        </p>
      </div>
      <div className="testimonials-grid">
        {reviews.map((review, i) => (
          <article className={`testimonial-card soft-card ${i < 2 ? "featured" : ""}`} key={i}>
            <div className="testimonial-stars">
              {"★".repeat(review.stars)}
              {"☆".repeat(5 - review.stars)}
            </div>
            <blockquote>«{review.text}»</blockquote>
            <div className="testimonial-author">
              <div className="author-avatar">
                {review.name[0]}
              </div>
              <div>
                <strong>{review.name}</strong>
                <small>{review.role}</small>
              </div>
              <span className="chip sage">{review.practice}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
