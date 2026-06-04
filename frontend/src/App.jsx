import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Club from './pages/Club'
import Compatibility from './pages/Compatibility'
import Report from './pages/Report'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import CheckoutCancel from './pages/CheckoutCancel'
import Faq from './pages/Faq'
import './App.css'

function SimpleLegalPage({ title, children }) {
  return (
    <section className="narrow-page section">
      <article className="soft-card">
        <span className="eyebrow">Numerologic</span>
        <h1>{title}</h1>
        <div className="legal-copy">{children}</div>
      </article>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="result" element={<Result />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="club" element={<Club />} />
          <Route path="compatibility" element={<Compatibility />} />
          <Route path="report/:id" element={<Report />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/success" element={<CheckoutSuccess />} />
          <Route path="checkout/cancel" element={<CheckoutCancel />} />
          <Route path="faq" element={<Faq />} />
          <Route
            path="privacy"
            element={
              <SimpleLegalPage title="Политика конфиденциальности">
                <p>Мы используем имя, дату рождения, ответы опроса и контактные данные только для подготовки разборов, сохранения результатов и обработки заказов.</p>
                <p>Numerologic — инструмент саморефлексии. Данные не должны использоваться для медицинских, юридических, финансовых или иных профессиональных решений без консультации специалиста.</p>
              </SimpleLegalPage>
            }
          />
          <Route
            path="terms"
            element={
              <SimpleLegalPage title="Условия использования">
                <p>Сервис предоставляет нумерологические digital-разборы, мини-инсайты, совместимость и подписочные материалы в формате self-reflection продукта.</p>
                <p>Разборы не являются предсказанием будущего и не заменяют профессиональные консультации. Решения пользователь принимает самостоятельно.</p>
              </SimpleLegalPage>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
