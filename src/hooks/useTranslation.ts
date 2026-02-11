import { useState, useEffect, useCallback } from 'react';
import { i18n, TranslationKeys, Language } from '../i18n';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(i18n.language);

  useEffect(() => {
    const unsubscribe = i18n.subscribe((lang) => {
      setLanguage(lang);
    });
    return unsubscribe;
  }, []);

  const t = useCallback(
    <K1 extends keyof TranslationKeys, K2 extends keyof TranslationKeys[K1]>(
      section: K1,
      key: K2
    ): string => {
      return i18n.t(section, key);
    },
    [language]
  );

  const changeLanguage = useCallback(async (lang: Language) => {
    await i18n.setLanguage(lang);
  }, []);

  return { t, language, changeLanguage };
}
