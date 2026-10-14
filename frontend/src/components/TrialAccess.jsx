import { useI18n } from "../i18n";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
export default function TrialAccess({ onChanged }) {
  const { t: tr } = useI18n();
  const state = useLoad(api.dashboard),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function start() {
    setBusy(true);
    setError("");
    try {
      const trial = await api.trial();
      if (trial.active && !state.data?.trial.used)
        void api.track("trial_started", { source: "trial_access" });
      state.reload();
      onChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const d = state.data;
  if (!d || d.club) return null;
  return (
    <article className="trial-card soft-card">
      <div>
        <span className="chip">
          {tr(d.trial.active ? "Пробный доступ открыт" : "7 дней бесплатно")}
        </span>
        <h3>
          {tr(
            d.trial.active
              ? "Попробуйте всё в своём темпе."
              : d.trial.used
                ? "Пробный период завершён."
                : "Познакомьтесь со всем пространством.",
          )}
        </h3>
        <p>
          {tr(
            d.trial.active
              ? `Все материалы и практикумы доступны до ${new Date(d.trial.expires).toLocaleDateString("ru-RU")}.`
              : "Полные материалы, PDF и практикумы. Без карты и автоматических списаний. Дневник, карта чисел и цели всегда бесплатны.",
          )}
        </p>
      </div>
      {tr(
        d.trial.active ? (
          <Link className="secondary-button" to="/products">
            {tr(
              "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u2197",
            )}
          </Link>
        ) : !d.user.registered ? (
          <Link className="primary-button" to="/account">
            {tr(
              "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442",
            )}
          </Link>
        ) : !d.user.profile ? (
          <Link className="primary-button" to="/quiz">
            {tr(
              "\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u043F\u0440\u043E\u0444\u0438\u043B\u044C",
            )}
          </Link>
        ) : !d.trial.used ? (
          <button className="primary-button" onClick={start} disabled={busy}>
            {tr(busy ? "Открываем…" : "Начать 7 дней бесплатно")}
          </button>
        ) : (
          <Link className="secondary-button" to="/club">
            {tr(
              "\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u043A\u043B\u0443\u0431\u0430",
            )}
          </Link>
        ),
      )}
      {tr(error && <p role="alert">{tr(error)}</p>)}
    </article>
  );
}
