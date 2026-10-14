import { useI18n } from "../i18n";
export default function LanguageSwitch() {
  const { language, setLanguage } = useI18n();
  return (
    <div
      className="language-switch"
      role="group"
      aria-label={language === "en" ? "Interface language" : "Язык интерфейса"}
    >
      <button
        type="button"
        aria-pressed={language === "ru"}
        onClick={() => setLanguage("ru")}
      >
        RU
      </button>
      <button
        type="button"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
    </div>
  );
}
