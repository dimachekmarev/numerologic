import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
export default function TrialAccess({ onChanged }) {
  const state = useLoad(api.dashboard),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function start() {
    setBusy(true);
    setError("");
    try {
      await api.trial();
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
          {d.trial.active ? "Пробный доступ открыт" : "7 дней бесплатно"}
        </span>
        <h3>
          {d.trial.active
            ? "Попробуйте всё в своём темпе."
            : d.trial.used
              ? "Пробный период завершён."
              : "Познакомьтесь со всем пространством."}
        </h3>
        <p>
          {d.trial.active
            ? `Все материалы и практикумы доступны до ${new Date(d.trial.expires).toLocaleDateString("ru-RU")}.`
            : "Полные материалы, PDF и практикумы. Без карты и автоматических списаний. Дневник, карта чисел и цели всегда бесплатны."}
        </p>
      </div>
      {d.trial.active ? (
        <Link className="secondary-button" to="/products">
          Выбрать материал ↗
        </Link>
      ) : !d.user.registered ? (
        <Link className="primary-button" to="/account">
          Сохранить аккаунт
        </Link>
      ) : !d.user.profile ? (
        <Link className="primary-button" to="/quiz">
          Заполнить профиль
        </Link>
      ) : !d.trial.used ? (
        <button className="primary-button" onClick={start} disabled={busy}>
          {busy ? "Открываем…" : "Начать 7 дней бесплатно"}
        </button>
      ) : (
        <Link className="secondary-button" to="/club">
          Условия клуба
        </Link>
      )}
      {error && <p role="alert">{error}</p>}
    </article>
  );
}
