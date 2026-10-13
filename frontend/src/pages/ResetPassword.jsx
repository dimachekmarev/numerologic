import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import RecoveryCode from "../components/RecoveryCode";
export default function ResetPassword() {
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [password, setPassword] = useState(""),
    [result, setResult] = useState(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      setResult(
        await api.resetPassword({ email, password, recovery_code: code }),
      );
      setPassword("");
      setCode("");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section narrow-page">
      <div className="section-heading">
        <span className="eyebrow">Без потери записей</span>
        <h1>Вернуться в пространство.</h1>
        <p>Используйте email и резервный код, сохранённый при регистрации.</p>
      </div>
      {result ? (
        <>
          <p role="status">Пароль изменён. Вы вошли в свой аккаунт.</p>
          <RecoveryCode code={result.recovery_code} />
          <Link className="primary-button" to="/dashboard">
            Открыть мой кабинет
          </Link>
        </>
      ) : (
        <form className="soft-card form-grid" onSubmit={submit}>
          <label>
            Email аккаунта
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Резервный код
            <input
              type="text"
              required
              minLength={32}
              maxLength={128}
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Код из сохранённого файла"
            />
          </label>
          <label>
            Новый пароль
            <input
              type="password"
              required
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="primary-button" disabled={busy}>
            {busy ? "Восстанавливаем…" : "Восстановить доступ"}
          </button>
          {message && <p role="alert">{message}</p>}
          <p>
            Если вы ещё вошли на другом устройстве, создайте резервный код в
            настройках аккаунта.
          </p>
          <Link to="/account">Вернуться ко входу</Link>
        </form>
      )}
    </section>
  );
}
