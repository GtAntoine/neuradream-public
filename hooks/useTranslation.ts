import { useCallback } from 'react';
import { translations, Language } from '@/i18n/translations';

export function useTranslation(language: Language = 'fr') {
  const t = useCallback((key: keyof typeof translations.fr) => {
    return translations[language][key];
  }, [language]);

  return { t };
}