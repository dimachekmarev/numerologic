import { useI18n } from "../i18n";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
import RecoveryCode from "../components/RecoveryCode";
function ProfileForm({ user, onSaved }) {
  const { t: tr } = useI18n();
  const [name, setName] = useState(user.name === "Гость" ? "" : user.name);
  const [birth, setBirth] = useState(user.birth_date || "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await api.updateProfile({
        name,
        birth_date: birth,
        focus: user.focus || "Ясность",
      });
      setMessage("Профиль обновлён. Ваши записи сохранены.");
      onSaved();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="soft-card form-grid" onSubmit={save}>
      <h2>
        {tr("\u0412\u0430\u0448 \u043F\u0440\u043E\u0444\u0438\u043B\u044C")}
      </h2>
      <label>
        {tr("\u0418\u043C\u044F")}
        <input
          required
          maxLength={128}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
        />
      </label>
      <label>
        {tr(
          "\u0414\u0430\u0442\u0430 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F",
        )}
        <input
          required
          type="date"
          min="1900-01-01"
          max={localDay()}
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
        />
      </label>
      <button className="secondary-button" disabled={busy}>
        {tr(busy ? "Сохраняем…" : "Обновить профиль")}
      </button>
      <p role="status">{tr(message)}</p>
    </form>
  );
}
export default function Account() {
  const { t: tr } = useI18n();
  const state = useLoad(api.me),
    [mode, setMode] = useState("register"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false),
    [recovery, setRecovery] = useState(null);
  async function auth(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await api[mode]({
        email,
        password,
      });
      setRecovery(result.recovery_code || null);
      setPassword("");
      setMessage(
        mode === "register"
          ? "Аккаунт сохранён. Входите с этим email на других устройствах."
          : "Вы вошли",
      );
      if (mode === "register") api.track("account_registered");
      state.reload();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function backup() {
    try {
      const blob = new Blob([JSON.stringify(await api.export(), null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "numerologic-personal-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setMessage(e.message);
    }
  }
  async function logout() {
    await api.logout();
    for (const key of Object.keys(sessionStorage))
      if (key.startsWith("numerologic_") && key !== "numerologic_language") sessionStorage.removeItem(key);
    localStorage.removeItem("numerologic_quiz");
    localStorage.removeItem("numerologic_result");
    window.location.assign(import.meta.env.BASE_URL);
  }
  async function remove() {
    try {
      await api.removeAccount();
      for (const key of Object.keys(localStorage))
        if (key.startsWith("numerologic_") && key !== "numerologic_language") localStorage.removeItem(key);
      for (const key of Object.keys(sessionStorage))
        if (key.startsWith("numerologic_") && key !== "numerologic_language") sessionStorage.removeItem(key);
      window.location.assign(import.meta.env.BASE_URL);
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <section className="section narrow-page">
      <div className="section-heading">
        <span className="eyebrow">
          {tr(
            "\u041B\u0438\u0447\u043D\u043E\u0435 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E",
          )}
        </span>
        <h1>
          {tr("\u0412\u0430\u0448 \u0430\u043A\u043A\u0430\u0443\u043D\u0442.")}
        </h1>
        <p>
          {tr(
            "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0435 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u0443, \u043F\u043E\u043A\u0443\u043F\u043A\u0430\u043C \u0438 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0430\u043C \u043D\u0430 \u0432\u0441\u0435\u0445 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430\u0445.",
          )}
        </p>
      </div>
      <Status {...state} />
      {tr(
        state.data?.registered ? (
          <article className="soft-card feature-card">
            <h2>{state.data.name}</h2>
            <p>{tr(state.data.email || "Вход через Telegram")}</p>
            <div className="hero-actions">
              <button className="secondary-button" onClick={backup}>
                {tr(
                  "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043C\u043E\u0438 \u0434\u0430\u043D\u043D\u044B\u0435",
                )}
              </button>
              <button className="ghost-button" onClick={logout}>
                {tr("\u0412\u044B\u0439\u0442\u0438")}
              </button>
            </div>
          </article>
        ) : (
          <form className="soft-card form-grid" onSubmit={auth}>
            <div className="filter-row">
              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => setMode("register")}
              >
                {tr(
                  "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442",
                )}
              </button>
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
              >
                {tr(
                  "\u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442",
                )}
              </button>
            </div>
            <label>
              Email
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              {tr(
                "\u041F\u0430\u0440\u043E\u043B\u044C, \u043E\u0442 10 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432",
              )}
              <input
                required
                type="password"
                minLength={10}
                maxLength={128}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button className="primary-button" disabled={busy}>
              {tr(
                busy
                  ? "Сохраняем…"
                  : mode === "register"
                    ? "Создать аккаунт"
                    : "Войти",
              )}
            </button>
            <Link to="/reset-password">
              {tr(
                "\u0417\u0430\u0431\u044B\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C?",
              )}
            </Link>
          </form>
        ),
      )}
      <p role="status">{tr(message)}</p>
      <RecoveryCode code={recovery} />
      {tr(state.data?.registered && <Security onRecovery={setRecovery} />)}
      {tr(
        state.data && (
          <ProfileForm
            key={state.data.id}
            user={state.data}
            onSaved={state.reload}
          />
        ),
      )}
      {tr(
        state.data && (
          <div className="section form-grid">
            <h3>
              {tr(
                "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0434\u0430\u043D\u043D\u044B\u0445",
              )}
            </h3>
            <p>
              {tr(
                "\u0423\u0434\u0430\u043B\u044F\u0442\u0441\u044F \u043F\u0440\u043E\u0444\u0438\u043B\u044C, \u0434\u043D\u0435\u0432\u043D\u0438\u043A, \u0446\u0435\u043B\u0438, \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0438 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043E\u0442\u0447\u0451\u0442\u0430\u043C. \u041E\u0431\u0435\u0437\u043B\u0438\u0447\u0435\u043D\u043D\u044B\u0435 \u0437\u0430\u043F\u0438\u0441\u0438 \u043E\u043F\u043B\u0430\u0442\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0434\u043B\u044F \u0443\u0447\u0451\u0442\u0430.",
              )}
            </p>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
              />
              {tr(
                "\u042F \u043F\u043E\u043D\u0438\u043C\u0430\u044E, \u0447\u0442\u043E \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u043D\u0435\u043B\u044C\u0437\u044F \u043E\u0442\u043C\u0435\u043D\u0438\u0442\u044C",
              )}
            </label>
            <button
              className="secondary-button"
              disabled={!confirm}
              onClick={remove}
            >
              {tr(
                "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0438 \u0434\u0430\u043D\u043D\u044B\u0435",
              )}
            </button>
          </div>
        ),
      )}
    </section>
  );
}
function Security({ onRecovery }) {
  const { t: tr } = useI18n();
  const [current, setCurrent] = useState(""),
    [next, setNext] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function action(mode) {
    setBusy(true);
    setMessage("");
    try {
      if (mode === "code") {
        const r = await api.recoveryCode(current);
        onRecovery(r.recovery_code);
        setMessage("Предыдущий резервный код заменён. Сохраните новый.");
      } else {
        await api.changePassword({
          current_password: current,
          password: next,
        });
        setMessage("Пароль изменён. Другие устройства вышли из аккаунта.");
      }
      setCurrent("");
      setNext("");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="soft-card security-panel">
      <summary>
        {tr(
          "\u041F\u0430\u0440\u043E\u043B\u044C \u0438 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u0430",
        )}
      </summary>
      <div className="form-grid">
        <label>
          {tr(
            "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0430\u0440\u043E\u043B\u044C",
          )}
          <input
            type="password"
            autoComplete="current-password"
            minLength={10}
            maxLength={128}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </label>
        <button
          className="secondary-button"
          disabled={busy || current.length < 10}
          onClick={() => action("code")}
        >
          {tr(
            "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0439 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0439 \u043A\u043E\u0434",
          )}
        </button>
        <label>
          {tr(
            "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C",
          )}
          <input
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={128}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </label>
        <button
          className="secondary-button"
          disabled={busy || current.length < 10 || next.length < 10}
          onClick={() => action("password")}
        >
          {tr(
            "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C",
          )}
        </button>
        <p role="status">{tr(message)}</p>
      </div>
    </details>
  );
}
