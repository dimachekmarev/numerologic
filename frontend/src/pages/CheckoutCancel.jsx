import { useI18n } from "../i18n";
import { Link } from "react-router-dom";
export default function CheckoutCancel() {
  const { t: tr } = useI18n();
  return (
    <section className="narrow-page empty-state">
      <h1>{tr("Checkout \u043E\u0442\u043C\u0435\u043D\u0451\u043D")}</h1>
      <p>
        {tr(
          "\u0417\u0430\u043A\u0430\u0437 \u043D\u0435 \u043E\u043F\u043B\u0430\u0447\u0435\u043D. \u041C\u043E\u0436\u043D\u043E \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0430\u043C \u0438\u043B\u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430.",
        )}
      </p>
      <div className="hero-actions">
        <Link className="primary-button" to="/checkout">
          {tr("\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C")}
        </Link>
        <Link className="secondary-button" to="/products">
          {tr("\u0412 \u043A\u0430\u0442\u0430\u043B\u043E\u0433")}
        </Link>
      </div>
    </section>
  );
}
