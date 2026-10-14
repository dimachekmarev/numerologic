import { useI18n } from "../i18n";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import RecoveryCode from "../components/RecoveryCode";
export default function ResetPassword() {
  const { t: tr } = useI18n();
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
        await api.resetPassword({
          email,
          password,
          recovery_code: code,
        }),
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
        <span className="eyebrow">
          {tr(
            "\u0411\u0435\u0437 \u043F\u043E\u0442\u0435\u0440\u0438 \u0437\u0430\u043F\u0438\u0441\u0435\u0439",
          )}
        </span>
        <h1>
          {tr(
            "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u0432 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E.",
          )}
        </h1>
        <p>
          {tr(
            "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 email \u0438 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0439 \u043A\u043E\u0434, \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0439 \u043F\u0440\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438.",
          )}
        </p>
      </div>
      {tr(
        result ? (
          <>
            <p role="status">
              {tr(
                "\u041F\u0430\u0440\u043E\u043B\u044C \u0438\u0437\u043C\u0435\u043D\u0451\u043D. \u0412\u044B \u0432\u043E\u0448\u043B\u0438 \u0432 \u0441\u0432\u043E\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442.",
              )}
            </p>
            <RecoveryCode code={result.recovery_code} />
            <Link className="primary-button" to="/dashboard">
              {tr(
                "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442",
              )}
            </Link>
          </>
        ) : (
          <form className="soft-card form-grid" onSubmit={submit}>
            <label>
              {tr("Email \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430")}
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              {tr(
                "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0439 \u043A\u043E\u0434",
              )}
              <input
                type="text"
                required
                minLength={32}
                maxLength={128}
                autoComplete="off"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={tr("Код из сохранённого файла")}
              />
            </label>
            <label>
              {tr(
                "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C",
              )}
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
              {tr(busy ? "Восстанавливаем…" : "Восстановить доступ")}
            </button>
            {tr(message && <p role="alert">{tr(message)}</p>)}
            <p>
              {tr(
                "\u0415\u0441\u043B\u0438 \u0432\u044B \u0435\u0449\u0451 \u0432\u043E\u0448\u043B\u0438 \u043D\u0430 \u0434\u0440\u0443\u0433\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435, \u0441\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0439 \u043A\u043E\u0434 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430.",
              )}
            </p>
            <Link to="/account">
              {tr(
                "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A\u043E \u0432\u0445\u043E\u0434\u0443",
              )}
            </Link>
          </form>
        ),
      )}
    </section>
  );
}
