import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad, localDay } from "../hooks";
import Status from "../components/Status";
import RecoveryCode from "../components/RecoveryCode";
function ProfileForm({ user, onSaved }) {
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
      <h2>Ваш профиль</h2>
      <label>
        Имя
        <input
          required
          maxLength={128}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
        />
      </label>
      <label>
        Дата рождения
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
        {busy ? "Сохраняем…" : "Обновить профиль"}
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
export default function Account() {
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
      const result = await api[mode]({ email, password });
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
      if (key.startsWith("numerologic_")) sessionStorage.removeItem(key);
    localStorage.removeItem("numerologic_quiz");
    localStorage.removeItem("numerologic_result");
    window.location.assign(import.meta.env.BASE_URL);
  }
  async function remove() {
    try {
      await api.removeAccount();
      for (const key of Object.keys(localStorage))
        if (key.startsWith("numerologic_")) localStorage.removeItem(key);
      for (const key of Object.keys(sessionStorage))
        if (key.startsWith("numerologic_")) sessionStorage.removeItem(key);
      window.location.assign(import.meta.env.BASE_URL);
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <section className="section narrow-page">
      <div className="section-heading">
        <span className="eyebrow">Личное пространство</span>
        <h1>Ваш аккаунт.</h1>
        <p>
          Сохраните доступ к дневнику, покупкам и практикам на всех устройствах.
        </p>
      </div>
      <Status {...state} />
      {state.data?.registered ? (
        <article className="soft-card feature-card">
          <h2>{state.data.name}</h2>
          <p>{state.data.email || "Вход через Telegram"}</p>
          <div className="hero-actions">
            <button className="secondary-button" onClick={backup}>
              Скачать мои данные
            </button>
            <button className="ghost-button" onClick={logout}>
              Выйти
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
              Сохранить аккаунт
            </button>
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Уже есть аккаунт
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
            Пароль, от 10 символов
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
            {busy
              ? "Сохраняем…"
              : mode === "register"
                ? "Создать аккаунт"
                : "Войти"}
          </button>
          <Link to="/reset-password">Забыли пароль?</Link>
        </form>
      )}
      <p role="status">{message}</p>
      <RecoveryCode code={recovery} />
      {state.data?.registered && <Security onRecovery={setRecovery} />}
      {state.data && (
        <ProfileForm
          key={state.data.id}
          user={state.data}
          onSaved={state.reload}
        />
      )}
      {state.data && (
        <div className="section form-grid">
          <h3>Удаление данных</h3>
          <p>
            Удалятся профиль, дневник, цели, прогресс и доступ к отчётам.
            Обезличенные записи оплаты сохраняются для учёта.
          </p>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
            />
            Я понимаю, что удаление нельзя отменить
          </label>
          <button
            className="secondary-button"
            disabled={!confirm}
            onClick={remove}
          >
            Удалить аккаунт и данные
          </button>
        </div>
      )}
    </section>
  );
}

function Security({ onRecovery }) {
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
        await api.changePassword({ current_password: current, password: next });
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
      <summary>Пароль и восстановление доступа</summary>
      <div className="form-grid">
        <label>
          Текущий пароль
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
          Создать новый резервный код
        </button>
        <label>
          Новый пароль
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
          Изменить пароль
        </button>
        <p role="status">{message}</p>
      </div>
    </details>
  );
}
