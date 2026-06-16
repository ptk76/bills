import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import { translations, Lang, TranslationKey } from "./translations";

const STORAGE_KEY = "lang";
const DEFAULT_LANG: Lang = "en";

function getInitialLang(): Lang {
  // const saved = localStorage.getItem(STORAGE_KEY);
  // if (saved && saved in translations) return saved as Lang;
  return navigator.language.substring(0, 2) as Lang;
  // return DEFAULT_LANG;
}

export type TFunction = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback<TFunction>(
    (key, params) => {
      const dict = translations[lang] ?? translations[DEFAULT_LANG];
      const template = dict[key] ?? translations[DEFAULT_LANG][key] ?? key;
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (match, name) =>
        params[name] != null ? String(params[name]) : match,
      );
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useT(): TFunction {
  return useI18n().t;
}
