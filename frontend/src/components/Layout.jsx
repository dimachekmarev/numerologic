import { useI18n } from "../i18n";
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BrandMark from "./BrandMark";
import { api } from "../api";
import { useLoad } from "../hooks";
import BottomNav from "./BottomNav";
export default function Layout() {
  const { language } = useI18n(),
    en = language === "en";
  const { pathname } = useLocation();
  const config = useLoad(api.config);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <div className="app-shell">
      {config.data?.test_mode && (
        <div className="demo-banner" role="status">
          {en
            ? "Demo · purchases are simulated, no money is charged"
            : "Демонстрационная версия · покупки тестовые, деньги не списываются"}
        </div>
      )}
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="cozy-footer-grid">
          <div>
            <Link to="/" className="brand">
              <BrandMark decorative size={32} />
              <span>numerologic</span>
            </Link>
            <p>
              {en
                ? "A place for your thoughts, discoveries and small everyday rituals. A little closer to yourself."
                : "Место для ваших мыслей, открытий и маленьких ежедневных ритуалов. Немного ближе к себе."}
            </p>
          </div>
          <nav aria-label={en ? "Your space" : "Ваше пространство"}>
            <strong>{en ? "Your space" : "Ваше пространство"}</strong>
            {[
              ["/numbers", "Моя карта", "My chart"],
              ["/journal", "Дневник", "Journal"],
              ["/rituals", "Мои ритуалы", "My rituals"],
              ["/practices", "Практики", "Practices"],
              ["/club", "Клуб", "Club"],
            ].map(([to, ru, english]) => (
              <Link key={to} to={to}>
                {en ? english : ru}
              </Link>
            ))}
          </nav>
          <nav aria-label={en ? "About Numerologic" : "О Numerologic"}>
            <strong>{en ? "A little more" : "Чуть больше"}</strong>
            {[
              ["/faq", "Частые вопросы", "Common questions"],
              ["/account", "Мой аккаунт", "My account"],
              ["/terms", "Условия", "Terms"],
              ["/privacy", "Приватность", "Privacy"],
            ].map(([to, ru, english]) => (
              <Link key={to} to={to}>
                {en ? english : ru}
              </Link>
            ))}
          </nav>
        </div>
        <div className="cozy-footer-bottom">
          <span>© {new Date().getFullYear()} Numerologic</span>
          <span>
            {en
              ? "Your thoughts. Your pace. Your decisions."
              : "Ваши мысли. Ваш темп. Ваши решения."}
          </span>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
