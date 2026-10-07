import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { request } from "../api";
export default function ResetPassword() {
  const [params] = useSearchParams(),
    token = params.get("token"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await request(
        token ? "/api/auth/reset-password" : "/api/auth/request-reset",
        {
          method: "POST",
          body: JSON.stringify(token ? { token, password } : { email }),
        },
      );
      setMessage(result.message);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section narrow-page">
      <form className="soft-card form-grid" onSubmit={submit}>
        <h1>Вернуться в пространство.</h1>
        {token ? (
          <label>
            Новый пароль
            <input
              type="password"
              required
              minLength={10}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
        ) : (
          <label>
            Email аккаунта
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
        )}
        <button className="primary-button" disabled={busy}>
          {busy
            ? "Подождите…"
            : token
              ? "Установить пароль"
              : "Получить ссылку"}
        </button>
        <p role="status">{message}</p>
        <Link to="/account">Вернуться ко входу</Link>
      </form>
    </section>
  );
}
