import { Link } from "react-router-dom";
import { api, API_BASE } from "../api";
import { useLoad } from "../hooks";
import { meanings } from "../utils/numerology";
import Status from "../components/Status";
const prompts = {
  1: "Какой первый шаг зависит от меня?",
  2: "О чём я хочу договориться?",
  3: "Какую мысль пора выразить?",
  4: "Какая опора поможет сейчас?",
  5: "Что можно попробовать по-другому?",
  6: "Как позаботиться о себе без перегруза?",
  7: "Что мне помогут понять факты?",
  8: "Какие ресурсы уже доступны?",
  9: "Что я готова или готов завершить?",
  11: "Как воплотить вдохновение в одном действии?",
  22: "Как разбить большой замысел на посильные шаги?",
  33: "Как поддерживать других, сохраняя свои границы?",
};
export default function Numbers() {
  const state = useLoad(api.me),
    p = state.data?.profile;
  return (
    <section className="section">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Ваша персональная карта</span>
          <h1>Числа. Смысл. Следующий шаг.</h1>
          <p>
            Открытый расчёт и вопросы для самонаблюдения. Мастер-числа 11, 22 и
            33 сохраняются.
          </p>
        </div>
        {p && (
          <a className="secondary-button" href={`${API_BASE}/api/profile/pdf`}>
            Скачать карту PDF ↓
          </a>
        )}
      </div>
      <Status {...state} />
      {state.data && !p ? (
        <article className="soft-card feature-card">
          <h2>Начнём с вашей даты.</h2>
          <p>
            Заполните имя и дату рождения. Карта сохраняется в вашем кабинете.
          </p>
          <Link className="primary-button" to="/quiz">
            Рассчитать мою карту
          </Link>
        </article>
      ) : (
        p && (
          <>
            <article className="soft-card map-hero">
              <div className="map-number">{p.life_path}</div>
              <div>
                <span className="chip">
                  Число жизненного пути
                  {p.life_path > 9 ? " · мастер-число" : ""}
                </span>
                <h2>{p.meaning}</h2>
                <p>{prompts[p.life_path]}</p>
                <p className="arithmetic">{p.arithmetic}</p>
                <Link className="ghost-button" to="/journal">
                  Записать свой ответ ↗
                </Link>
              </div>
            </article>
            <div className="numbers-grid">
              {[
                [
                  "destiny",
                  "Число имени",
                  "Сумма букв имени. Каким замыслам хочется дать форму?",
                ],
                [
                  "soul",
                  "Внутренний запрос",
                  "Гласные имени. Что важно лично вам?",
                ],
                [
                  "personality",
                  "Внешнее выражение",
                  "Согласные имени. Как вы объясняете себя другим?",
                ],
                [
                  "birthday",
                  "Число дня рождения",
                  "День месяца. Какая тема отзывается сейчас?",
                ],
                [
                  "year",
                  "Личный год",
                  "День + месяц рождения + текущий год. Повод выбрать тему наблюдений.",
                ],
                [
                  "month",
                  "Личный месяц",
                  "Личный год + текущий месяц. Повод для небольшого действия.",
                ],
              ].map(([key, title, note]) => (
                <article className="soft-card number-tile" key={key}>
                  <strong>{p[key]}</strong>
                  <h3>{title}</h3>
                  <p>{meanings[p[key]]}</p>
                  <small>{note}</small>
                </article>
              ))}
            </div>
            <details className="soft-card method-card">
              <summary>Как считаются числа?</summary>
              <p>{p.system}</p>
              <p>
                Для имени используйте одинаковое написание. Смена имени изменит
                числа букв, но не число даты рождения. Эти символические
                трактовки не определяют характер или будущие события.
              </p>
              <Link to="/account">Изменить имя и дату</Link>
            </details>
            <div className="hero-actions section">
              <Link className="primary-button" to="/today">
                Моя тема дня ↗
              </Link>
              <Link className="secondary-button" to="/compatibility">
                Карта пары
              </Link>
              <Link className="secondary-button" to="/calendar">
                Темы месяца
              </Link>
            </div>
          </>
        )
      )}
    </section>
  );
}
