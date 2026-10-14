import { useI18n } from "../i18n";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
export default function CheckoutSuccess() {
  const { t: tr } = useI18n();
  const [params] = useSearchParams(),
    id = params.get("order_id"),
    [state, setState] = useState({
      loading: true,
      data: null,
      error: "",
    }),
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
        setState({
          loading: false,
          data,
          error: "",
        });
        if (data.status === "pending" && tries++ < 12)
          timer = setTimeout(check, 5000);
      } catch (e) {
        if (alive)
          setState({
            loading: false,
            data: null,
            error: e.message,
          });
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
        <span className="chip">
          {tr(
            "\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043A\u0430\u0437\u0430",
          )}
        </span>
        <h1>
          {tr(
            state.loading
              ? "Проверяем оплату…"
              : state.data?.status === "paid"
                ? "Ваш материал готов."
                : state.data?.status === "canceled"
                  ? "Платёж отменён."
                  : "Ждём подтверждение.",
          )}
        </h1>
        {tr(state.error && <p role="alert">{tr(state.error)}</p>)}
        {tr(
          state.data?.status === "pending" && (
            <p>
              {tr(
                "\u0415\u0441\u043B\u0438 \u043E\u043F\u043B\u0430\u0442\u0438\u043B\u0438, \u043F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435 \u043D\u0435\u043C\u043D\u043E\u0433\u043E. \u041C\u044B \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0441\u0442\u0430\u0442\u0443\u0441 \u0443 \u043F\u043B\u0430\u0442\u0451\u0436\u043D\u043E\u0433\u043E \u0441\u0435\u0440\u0432\u0438\u0441\u0430.",
              )}
            </p>
          ),
        )}
        <div className="hero-actions">
          {tr(
            state.data?.report_id && (
              <Link
                className="primary-button"
                to={`/report/${state.data.report_id}`}
              >
                {tr(
                  "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B",
                )}
              </Link>
            ),
          )}
          {tr(
            state.data?.subscription_id && (
              <Link className="primary-button" to="/practices">
                {tr(
                  "\u0412\u0441\u0435 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438 \u043E\u0442\u043A\u0440\u044B\u0442\u044B",
                )}
              </Link>
            ),
          )}
          <Link className="secondary-button" to="/dashboard">
            {tr("\u0412 \u043A\u0430\u0431\u0438\u043D\u0435\u0442")}
          </Link>
          {tr(
            state.data?.status !== "paid" && (
              <button
                className="ghost-button"
                onClick={() => setAttempt((x) => x + 1)}
              >
                {tr(
                  "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0435\u0449\u0451 \u0440\u0430\u0437",
                )}
              </button>
            ),
          )}
        </div>
      </article>
    </section>
  );
}
