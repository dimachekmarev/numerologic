import { Link } from "react-router-dom";

export default function GuaranteeBadge() {
  return (
    <section className="guarantee-section">
      <div className="guarantee-card">
        <div className="guarantee-shield">
          <span>🛡</span>
        </div>
        <div className="guarantee-content">
          <h2>Честная гарантия</h2>
          <p>
            Мы не обещаем, что числа изменят вашу жизнь. Но мы обещаем, что практики 
            помогут услышать себя — если вы уделите им время.
          </p>
          <div className="guarantee-points">
            <div className="guarantee-point">
              <span className="check">✓</span>
              <div>
                <strong>7 дней бесплатно</strong>
                <small>Попробуйте все практики и материалы без карты</small>
              </div>
            </div>
            <div className="guarantee-point">
              <span className="check">✓</span>
              <div>
                <strong>Без автосписаний</strong>
                <small>Продлеваете только когда сами решите</small>
              </div>
            </div>
            <div className="guarantee-point">
              <span className="check">✓</span>
              <div>
                <strong>Прозрачный расчёт</strong>
                <small>Видите арифметику карты, не только результат</small>
              </div>
            </div>
            <div className="guarantee-point">
              <span className="check">✓</span>
              <div>
                <strong>Ваши данные — ваши</strong>
                <small>Экспорт и удаление в один клик</small>
              </div>
            </div>
          </div>
          <Link className="primary-button" to="/quiz">
            Начать бесплатно →
          </Link>
        </div>
      </div>
    </section>
  );
}
