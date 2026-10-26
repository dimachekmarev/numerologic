export default function SocialProof() {
  const stats = [
    { value: "1 200+", label: "человек нашли свой ритм", icon: "👤" },
    { value: "8 400+", label: "записей в дневниках", icon: "📝" },
    { value: "4.8", label: "средняя оценка практиик", icon: "⭐" },
    { value: "73%", label: "возвращаются на 2-й день", icon: "🔄" },
  ];

  return (
    <section className="social-proof-bar">
      <div className="proof-stats">
        {stats.map((stat) => (
          <div className="proof-item" key={stat.label}>
            <span className="proof-icon">{stat.icon}</span>
            <div>
              <strong>{stat.value}</strong>
              <small>{stat.label}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
