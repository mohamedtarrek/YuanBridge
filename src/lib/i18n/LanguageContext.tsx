"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Language } from "./translations";
import { translations } from "./translations";

const ARAB_COUNTRIES = new Set([
  "SA", "AE", "QA", "KW", "BH", "OM", "YE", "IQ", "JO", "LB",
  "PS", "SY", "EG", "SD", "LY", "TN", "DZ", "MA", "MR", "SO",
  "DJ", "KM",
]);

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("yb_lang") as Language | null;
    if (stored === "en" || stored === "ar") {
      setLangState(stored);
      return;
    }

    fetch("https://ip-api.com/json/")
      .then((res) => res.json())
      .then((data) => {
        const detectedLang: Language =
          data.countryCode && ARAB_COUNTRIES.has(data.countryCode) ? "ar" : "en";
        setLangState(detectedLang);
        localStorage.setItem("yb_lang", detectedLang);
        document.documentElement.dir = detectedLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = detectedLang;
      })
      .catch(() => {
        const browserLang = navigator.language?.slice(0, 2);
        if (browserLang === "ar") {
          setLangState("ar");
        }
      });
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("yb_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[lang]?.[key] ?? key;
    },
    [lang]
  );

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
