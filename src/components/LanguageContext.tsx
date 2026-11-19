"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  DICTIONARIES,
  detectBrowserLanguage,
  type Dictionary,
  type SupportedLang,
} from "@/lib/i18n";

interface LanguageContextValue {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: DICTIONARIES.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SupportedLang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("jukira_lang") as SupportedLang | null;
    if (saved && DICTIONARIES[saved]) {
      setLangState(saved);
    } else {
      setLangState(detectBrowserLanguage());
    }
  }, []);

  function setLang(next: SupportedLang) {
    setLangState(next);
    window.localStorage.setItem("jukira_lang", next);
  }

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t: DICTIONARIES[lang] || DICTIONARIES.en }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
