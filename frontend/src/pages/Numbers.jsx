import { useI18n } from "../i18n";
import { Link } from "react-router-dom";
import { api, API_BASE } from "../api";
import { useLoad } from "../hooks";
import { meanings } from "../utils/numerology";
import Status from "../components/Status";
import NumberOrbit from "../components/NumberOrbit";
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
  const { t: tr, language } = useI18n();
  const state = useLoad(api.me),
    p = state.data?.profile;
  return (
    <section className="section">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">
            {tr(
              "\u0412\u0430\u0448\u0430 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430",
            )}
          </span>
          <h1>
            {tr(
              "\u0427\u0438\u0441\u043B\u0430. \u0421\u043C\u044B\u0441\u043B. \u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433.",
            )}
          </h1>
          <p>
            {tr(
              "\u041E\u0442\u043A\u0440\u044B\u0442\u044B\u0439 \u0440\u0430\u0441\u0447\u0451\u0442 \u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0434\u043B\u044F \u0441\u0430\u043C\u043E\u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u044F. \u041C\u0430\u0441\u0442\u0435\u0440-\u0447\u0438\u0441\u043B\u0430 11, 22 \u0438 33 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F.",
            )}
          </p>
        </div>
        {tr(
          p && (
            <a
              className="secondary-button"
              href={`${API_BASE}/api/profile/pdf?lang=${language}`}
            >
              {tr(
                "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u0443 PDF \u2193",
              )}
            </a>
          ),
        )}
      </div>
      <Status {...state} />
      {tr(
        state.data && !p ? (
          <article className="soft-card feature-card">
            <h2>
              {tr(
                "\u041D\u0430\u0447\u043D\u0451\u043C \u0441 \u0432\u0430\u0448\u0435\u0439 \u0434\u0430\u0442\u044B.",
              )}
            </h2>
            <p>
              {tr(
                "\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0438\u043C\u044F \u0438 \u0434\u0430\u0442\u0443 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F. \u041A\u0430\u0440\u0442\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u0432 \u0432\u0430\u0448\u0435\u043C \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u0435.",
              )}
            </p>
            <Link className="primary-button" to="/quiz">
              {tr(
                "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044C \u043C\u043E\u044E \u043A\u0430\u0440\u0442\u0443",
              )}
            </Link>
          </article>
        ) : (
          p && (
            <>
              <article className="soft-card map-hero">
                <div className="map-number">{tr(p.life_path)}</div>
                <div>
                  <span className="chip">
                    {tr(
                      "\u0427\u0438\u0441\u043B\u043E \u0436\u0438\u0437\u043D\u0435\u043D\u043D\u043E\u0433\u043E \u043F\u0443\u0442\u0438",
                    )}
                    {tr(p.life_path > 9 ? " · мастер-число" : "")}
                  </span>
                  <h2>{tr(p.meaning)}</h2>
                  <p>{tr(prompts[p.life_path])}</p>
                  <p className="arithmetic">{tr(p.arithmetic)}</p>
                  <Link className="ghost-button" to="/journal">
                    {tr(
                      "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0441\u0432\u043E\u0439 \u043E\u0442\u0432\u0435\u0442 \u2197",
                    )}
                  </Link>
                </div>
              </article>
              <NumberOrbit profile={p} />
              <div className="numbers-grid">
                {tr(
                  [
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
                      <strong>{tr(p[key])}</strong>
                      <h3>{tr(title)}</h3>
                      <p>{tr(meanings[p[key]])}</p>
                      <small>{tr(note)}</small>
                    </article>
                  )),
                )}
              </div>
              <details className="soft-card method-card">
                <summary>
                  {tr(
                    "\u041A\u0430\u043A \u0441\u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u0447\u0438\u0441\u043B\u0430?",
                  )}
                </summary>
                <p>{tr(p.system)}</p>
                <p>
                  {tr(
                    "\u0414\u043B\u044F \u0438\u043C\u0435\u043D\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u043E\u0435 \u043D\u0430\u043F\u0438\u0441\u0430\u043D\u0438\u0435. \u0421\u043C\u0435\u043D\u0430 \u0438\u043C\u0435\u043D\u0438 \u0438\u0437\u043C\u0435\u043D\u0438\u0442 \u0447\u0438\u0441\u043B\u0430 \u0431\u0443\u043A\u0432, \u043D\u043E \u043D\u0435 \u0447\u0438\u0441\u043B\u043E \u0434\u0430\u0442\u044B \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F. \u042D\u0442\u0438 \u0441\u0438\u043C\u0432\u043E\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0442\u0440\u0430\u043A\u0442\u043E\u0432\u043A\u0438 \u043D\u0435 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u044E\u0442 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440 \u0438\u043B\u0438 \u0431\u0443\u0434\u0443\u0449\u0438\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u044F.",
                  )}
                </p>
                <Link to="/account">
                  {tr(
                    "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0438\u043C\u044F \u0438 \u0434\u0430\u0442\u0443",
                  )}
                </Link>
              </details>
              <div className="hero-actions section">
                <Link className="primary-button" to="/today">
                  {tr(
                    "\u041C\u043E\u044F \u0442\u0435\u043C\u0430 \u0434\u043D\u044F \u2197",
                  )}
                </Link>
                <Link className="secondary-button" to="/compatibility">
                  {tr(
                    "\u041A\u0430\u0440\u0442\u0430 \u043F\u0430\u0440\u044B",
                  )}
                </Link>
                <Link className="secondary-button" to="/calendar">
                  {tr(
                    "\u0422\u0435\u043C\u044B \u043C\u0435\u0441\u044F\u0446\u0430",
                  )}
                </Link>
              </div>
            </>
          )
        ),
      )}
    </section>
  );
}
