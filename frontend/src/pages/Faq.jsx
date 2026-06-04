import { Link } from 'react-router-dom'

const trustCards = [
  {
    title: 'Это не гадание',
    text: 'Numerologic не пугает будущим и не обещает невозможного. Это мягкий способ посмотреть на себя, отношения и текущий период через систему чисел.',
  },
  {
    title: 'Вы принимаете решения сами',
    text: 'Разбор не говорит, как жить. Он помогает увидеть закономерности, повторяющиеся сценарии и вернуть больше ясности.',
  },
  {
    title: 'Данные приватны',
    text: 'Имя, дата рождения и ответы опроса используются только для подготовки результата и сохранения отчёта.',
  },
  {
    title: 'Можно начать бесплатно',
    text: 'Первый мини-разбор помогает понять формат продукта до покупки полного отчёта или подписки.',
  },
]

const faqs = [
  ['Что нужно для разбора?', 'Имя, дата рождения и короткий ответ на вопрос, что сейчас хочется понять: себя, отношения, деньги, период или важное решение.'],
  ['Это предсказание?', 'Нет. Это self-discovery продукт: он помогает увидеть смыслы и сценарии, но не заменяет ваши решения и профессиональные консультации.'],
  ['Чем клуб отличается от разового отчёта?', 'Разовый отчёт отвечает на конкретный вопрос глубоко. Numerologic Club даёт регулярные подсказки, календарь периода и мягкое сопровождение каждый месяц.'],
  ['Что происходит после оплаты?', 'В mock-режиме заказ сразу отмечается как оплаченный, создаётся отчёт, и он открывается в личном кабинете. Реальную оплату можно подключить позже через YooKassa/CloudPayments.'],
  ['Можно ли проверить совместимость?', 'Да. В разделе “Совместимость” можно указать данные двух людей и получить мягкий разбор динамики пары: притяжение, коммуникация, конфликтные зоны и перспективы.'],
  ['Где менять продукты и цены?', 'Во фронтенде — в файле src/data/products.js. В backend для API-каталога — в PRODUCT_CATALOG/ADDON_CATALOG внутри backend/main.py.'],
]

export default function Faq() {
  return (
    <section className="section faq-page">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Доверие и вопросы</span>
          <h1>Без страха, давления и обещаний невозможного</h1>
          <p>Эта страница снимает главные сомнения перед покупкой: что это такое, как работает, что будет после оплаты и чем полезна подписка.</p>
        </div>
        <Link className="primary-button" to="/quiz">Начать бесплатно</Link>
      </div>

      <div className="dashboard-grid">
        {trustCards.map((card) => (
          <article className="soft-card" key={card.title}>
            <span className="chip sage">Важно</span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>

      <div className="section-heading" style={{ marginTop: 42 }}>
        <span className="eyebrow">FAQ</span>
        <h2>Частые вопросы</h2>
      </div>

      <div className="locked-list">
        {faqs.map(([question, answer]) => (
          <article className="soft-card report-section" key={question}>
            <h3>{question}</h3>
            <p>{answer}</p>
          </article>
        ))}
      </div>

      <article className="soft-card tint-rose" style={{ marginTop: 28 }}>
        <span className="chip">Первый шаг</span>
        <h2>Начните с мини-разбора</h2>
        <p>Пользователь получает первый результат бесплатно, затем видит подходящий полный продукт, допы и Numerologic Club.</p>
        <div className="hero-actions">
          <Link className="primary-button" to="/quiz">Пройти мини-разбор</Link>
          <Link className="secondary-button" to="/products">Посмотреть продукты</Link>
        </div>
      </article>
    </section>
  )
}
