import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLoad } from "../hooks";
import { useI18n } from "../i18n";
import Status from "../components/Status";
export default function Marketing() {
  const { language } = useI18n(),
    en = language === "en",
    state = useLoad(api.marketing),
    [locale, setLocale] = useState(language),
    [variant, setVariant] = useState("a"),
    [channel, setChannel] = useState("youtube"),
    [campaign, setCampaign] = useState("organic-launch"),
    [ref, setRef] = useState(""),
    [copied, setCopied] = useState(false);
  const url = new URL(`/landing-${variant}`, window.location.origin);
  url.searchParams.set("utm_source", channel);
  url.searchParams.set("utm_medium", "organic");
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", `${locale}-${variant}`);
  url.searchParams.set("lang", locale);
  if (ref.trim()) url.searchParams.set("ref", ref.trim());
  const items =
    state.data?.campaigns?.filter(
      (c) => c.locale === locale && c.variant === variant,
    ) || [];
  function download() {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
        type: "application/json",
      }),
      u = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = u;
    a.download = `numerologic-campaigns-${locale}-${variant}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">
          {en ? "Marketing workspace" : "Маркетинговое пространство"}
        </span>
        <h1>
          {en
            ? "One product. A clear route to it."
            : "Один продукт. Понятный путь к нему."}
        </h1>
        <p>
          {en
            ? "Prepared content and campaign links. Live social publishing needs connected channels and tokens."
            : "Готовые материалы и ссылки кампаний. Для живого автопостинга нужны подключённые каналы и токены."}
        </p>
      </div>
      <article className="soft-card form-grid">
        <h2>{en ? "Campaign link" : "Ссылка кампании"}</h2>
        <div className="goal-form">
          <label>
            {en ? "Channel" : "Канал"}
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="youtube">YouTube Shorts</option>
              <option value="tiktok">TikTok</option>
              <option value="telegram">Telegram</option>
              <option value="partner">{en ? "Partner" : "Партнёр"}</option>
            </select>
          </label>
          <label>
            {en ? "Language" : "Язык"}
            <select value={locale} onChange={(e) => setLocale(e.target.value)}>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
          </label>
          <label>
            {en ? "Landing" : "Лендинг"}
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
            >
              <option value="a">A</option>
              <option value="b">B</option>
            </select>
          </label>
        </div>
        <label>
          {en ? "Campaign name" : "Название кампании"}
          <input
            maxLength={80}
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
          />
        </label>
        <label>
          {en ? "Partner code (optional)" : "Код партнёра (необязательно)"}
          <input
            maxLength={60}
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
        </label>
        <code className="campaign-url">{url.toString()}</code>
        <button
          className="primary-button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url.toString());
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied
            ? en
              ? "Copied"
              : "Скопировано"
            : en
              ? "Copy link"
              : "Скопировать ссылку"}
        </button>
        <p className="small-note">
          {en
            ? "The app currently has private access. Public distribution requires changing access settings. Partner payouts start only after live payments and refund accounting are connected."
            : "Приложение пока имеет приватный доступ. Перед распространением нужно открыть доступ аудитории. Партнёрские выплаты запускаются после подключения живых платежей и учёта возвратов."}
        </p>
      </article>
      <div className="section-heading section split">
        <div>
          <h2>{en ? "A month of content" : "Контент на месяц"}</h2>
          <p>
            {en
              ? "Choose one hypothesis per channel and language. Compare registrations and returns."
              : "Выберите одну гипотезу на канал и язык. Сравнивайте регистрации и возвращения."}
          </p>
        </div>
        <button
          className="secondary-button"
          disabled={!items.length}
          onClick={download}
        >
          {en ? "Download queue JSON" : "Скачать очередь JSON"} ↓
        </button>
      </div>
      <Status {...state} />
      <div className="product-grid">
        {items.map((c) => (
          <article className="soft-card feature-card" key={c.id}>
            <span className="chip">
              {en ? "Day" : "День"} {c.day}
            </span>
            <h3>{c.hook}</h3>
            <p>{c.video_script}</p>
            <details>
              <summary>{en ? "Caption and link" : "Подпись и ссылка"}</summary>
              <p>{c.caption}</p>
              <a href={c.utm_link}>{c.cta}</a>
            </details>
          </article>
        ))}
      </div>
      <div className="hero-actions section">
        <Link className="secondary-button" to="/landing-a">
          {en ? "View landing A" : "Посмотреть лендинг A"} ↗
        </Link>
        <Link className="secondary-button" to="/landing-b">
          {en ? "View landing B" : "Посмотреть лендинг B"} ↗
        </Link>
      </div>
    </section>
  );
}
