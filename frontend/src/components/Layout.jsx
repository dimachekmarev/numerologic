import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import { api } from "../api";
import { useLoad } from "../hooks";
import BottomNav from "./BottomNav";
import StickyCTA from "./StickyCTA";

export default function Layout() {
  const { pathname } = useLocation();
  const config = useLoad(api.config);
  const me = useLoad(api.me);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  // Показываем Sticky CTA только на ключевых страницах и для незарегистрированных
  const showStickyCTA = 
    me.data && 
    !me.data.registered && 
    ["/", "/today", "/numbers", "/practices"].includes(pathname);

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

      {showStickyCTA && (
        <StickyCTA to="/account">
          Сохранить аккаунт — бесплатно
        </StickyCTA>
      )}

      <footer className="site-footer">
        <div className="footer-cta">
          <h3>Готовы уделить себе 5 минут?</h3>
          <p>Мини-разбор, карта чисел и первый день практики — бесплатно.</p>
          <Link className="primary-button cta-primary" to="/quiz">
            Найти свой первый шаг →
          </Link>
        </div>
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">N✦</span>
            <p>Numerologic — пространство саморефлексии</p>
            <small>Символы помогают задать вопрос. Ответы и решения остаются вашими.</small>
          </div>
          <nav className="footer-nav">
            <div className="footer-col">
              <strong>Продукт</strong>
              <Link to="/numbers">Карта чисел</Link>
              <Link to="/today">Тема дня</Link>
              <Link to="/practices">Практики</Link>
              <Link to="/club">Клуб</Link>
              <Link to="/products">Материалы</Link>
            </div>
            <div className="footer-col">
              <strong>Инструменты</strong>
              <Link to="/journal">Дневник</Link>
              <Link to="/calendar">Календарь</Link>
              <Link to="/goals">Цели</Link>
              <Link to="/weekly">Обзор недели</Link>
              <Link to="/assistant">AI-помощник</Link>
            </div>
            <div className="footer-col">
              <strong>Поддержка</strong>
              <Link to="/faq">Вопросы и ответы</Link>
              <Link to="/terms">Условия</Link>
              <Link to="/privacy">Приватность</Link>
              <Link to="/compatibility">Совместимость</Link>
            </div>
          </nav>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
