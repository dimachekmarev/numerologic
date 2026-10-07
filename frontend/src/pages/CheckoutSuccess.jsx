import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
export default function CheckoutSuccess() {
  const [params] = useSearchParams(),
    id = params.get("order_id"),
    [state, setState] = useState({ loading: true, data: null, error: "" }),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true,
      timer,
      tries = 0;
    async function check() {
      try {
        const cfg = await api.config();
        const data = cfg.test_mode
          ? await api.mockSuccess(id)
          : await api.order(id);
        if (!alive) return;
        setState({ loading: false, data, error: "" });
        if (data.status === "pending" && tries++ < 12)
          timer = setTimeout(check, 5000);
      } catch (e) {
        if (alive) setState({ loading: false, data: null, error: e.message });
      }
    }
    if (id) check();
    else
      setTimeout(() => {
        if (alive)
          setState({
            loading: false,
            data: null,
            error: "Не указан номер заказа",
          });
      }, 0);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [id, attempt]);
  return (
    <section className="section narrow-page">
      <article className="soft-card feature-card">
        <span className="chip">Статус заказа</span>
        <h1>
          {state.loading
            ? "Проверяем оплату…"
            : state.data?.status === "paid"
              ? "Ваш материал готов."
              : state.data?.status === "canceled"
                ? "Платёж отменён."
                : "Ждём подтверждение."}
        </h1>
        {state.error && <p role="alert">{state.error}</p>}
        {state.data?.status === "pending" && (
          <p>
            Если оплатили, подождите немного. Мы проверяем статус у платёжного
            сервиса.
          </p>
        )}
        <div className="hero-actions">
          {state.data?.report_id && (
            <Link
              className="primary-button"
              to={`/report/${state.data.report_id}`}
            >
              Открыть материал
            </Link>
          )}
          {state.data?.subscription_id && (
            <Link className="primary-button" to="/practices">
              Все практики открыты
            </Link>
          )}
          <Link className="secondary-button" to="/dashboard">
            В кабинет
          </Link>
          {state.data?.status !== "paid" && (
            <button
              className="ghost-button"
              onClick={() => setAttempt((x) => x + 1)}
            >
              Проверить ещё раз
            </button>
          )}
        </div>
      </article>
    </section>
  );
}
