"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { type Locale, translations } from "@/lib/translations";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: (typeof translations)["pl"];
} | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "pl";
    return (window.localStorage.getItem("dnax_locale") as Locale | null) ?? "pl";
  });

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem("dnax_locale", next);
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      copy: translations[locale],
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
