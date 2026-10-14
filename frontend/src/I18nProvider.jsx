import { useCallback, useEffect, useMemo, useState } from "react";
import { Context, translate } from "./i18n";

export function I18nProvider({ children }) {
  const [language, setState] = useState(() => {
    try {
      const query = new URLSearchParams(window.location.search).get("lang");
      if (query === "en" || query === "ru") {
        localStorage.setItem("numerologic_language", query);
        return query;
      }
      return localStorage.getItem("numerologic_language") === "en"
        ? "en"
        : "ru";
    } catch {
      return "ru";
    }
  });
  const setLanguage = useCallback((next) => {
    const lang = next === "en" ? "en" : "ru";
    setState(lang);
    try {
      localStorage.setItem("numerologic_language", lang);
    } catch {
      // Language remains usable when browser storage is unavailable.
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      language === "en"
        ? "Numerologic — your personal space"
        : "Numerologic — личное пространство";
  }, [language]);
  const value = useMemo(
    () => ({ language, setLanguage, t: (v) => translate(v, language) }),
    [language, setLanguage],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
