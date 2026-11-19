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
    const initial =
      saved && DICTIONARIES[saved] ? saved : detectBrowserLanguage();
    setLangState(initial);
    document.documentElement.lang = initial;
  }, []);

  function setLang(next: SupportedLang) {
    setLangState(next);
    window.localStorage.setItem("jukira_lang", next);
    document.documentElement.lang = next;
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
