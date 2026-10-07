import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import { api } from "../api";
import { useLoad } from "../hooks";
import BottomNav from "./BottomNav";
export default function Layout() {
  const { pathname } = useLocation();
  const config = useLoad(api.config);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <div className="app-shell">
      {config.data?.test_mode && (
        <div className="demo-banner" role="status">
          Демонстрационная версия · покупки тестовые, деньги не списываются
        </div>
      )}
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Numerologic · пространство саморефлексии</p>
        <nav>
          <Link to="/compatibility">Совместимость</Link>
          <Link to="/products">Материалы</Link>
          <Link to="/club">Клуб</Link>
          <Link to="/faq">Вопросы</Link>
          <Link to="/terms">Условия</Link>
          <Link to="/privacy">Приватность</Link>
        </nav>
        <small>
          Символы помогают задать вопрос. Ответы и решения остаются вашими.
        </small>
      </footer>
      <BottomNav />
    </div>
  );
}
