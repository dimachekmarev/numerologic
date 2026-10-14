import { useI18n } from "../i18n";
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import { api } from "../api";
import { useLoad } from "../hooks";
import BottomNav from "./BottomNav";
export default function Layout() {
  const { t: tr } = useI18n();
  const { pathname } = useLocation();
  const config = useLoad(api.config);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [pathname]);
  return (
    <div className="app-shell">
      {tr(
        config.data?.test_mode && (
          <div className="demo-banner" role="status">
            {tr(
              "\u0414\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F \xB7 \u043F\u043E\u043A\u0443\u043F\u043A\u0438 \u0442\u0435\u0441\u0442\u043E\u0432\u044B\u0435, \u0434\u0435\u043D\u044C\u0433\u0438 \u043D\u0435 \u0441\u043F\u0438\u0441\u044B\u0432\u0430\u044E\u0442\u0441\u044F",
            )}
          </div>
        ),
      )}
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          {tr(
            "Numerologic \xB7 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E \u0441\u0430\u043C\u043E\u0440\u0435\u0444\u043B\u0435\u043A\u0441\u0438\u0438",
          )}
        </p>
        <nav>
          <Link to="/rituals">{tr("Ритуалы")}</Link>
          <Link to="/marketing">{tr("Маркетинг")}</Link>
          <Link to="/numbers">
            {tr("\u041C\u043E\u044F \u043A\u0430\u0440\u0442\u0430")}
          </Link>
          <Link to="/weekly">
            {tr("\u041C\u043E\u044F \u043D\u0435\u0434\u0435\u043B\u044F")}
          </Link>
          <Link to="/assistant">
            {tr("\u041F\u043E\u043C\u043E\u0449\u043D\u0438\u043A")}
          </Link>
          <Link to="/compatibility">
            {tr(
              "\u0421\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C",
            )}
          </Link>
          <Link to="/products">
            {tr("\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B")}
          </Link>
          <Link to="/club">{tr("\u041A\u043B\u0443\u0431")}</Link>
          <Link to="/faq">
            {tr("\u0412\u043E\u043F\u0440\u043E\u0441\u044B")}
          </Link>
          <Link to="/terms">
            {tr("\u0423\u0441\u043B\u043E\u0432\u0438\u044F")}
          </Link>
          <Link to="/privacy">
            {tr(
              "\u041F\u0440\u0438\u0432\u0430\u0442\u043D\u043E\u0441\u0442\u044C",
            )}
          </Link>
        </nav>
        <small>
          {tr(
            "\u0421\u0438\u043C\u0432\u043E\u043B\u044B \u043F\u043E\u043C\u043E\u0433\u0430\u044E\u0442 \u0437\u0430\u0434\u0430\u0442\u044C \u0432\u043E\u043F\u0440\u043E\u0441. \u041E\u0442\u0432\u0435\u0442\u044B \u0438 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u0432\u0430\u0448\u0438\u043C\u0438.",
          )}
        </small>
      </footer>
      <BottomNav />
    </div>
  );
}
