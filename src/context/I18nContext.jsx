import React, { createContext, useContext, useState, useEffect } from 'react';
import bhsDict from '../locales/bhs.json';
import enDict from '../locales/en.json';
import { API_CONFIG } from '../config/api.config';

const dictionaries = {
  bhs: bhsDict,
  en: enDict
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.LANGUAGE) || 'bhs';
  });

  const setLanguage = (lang) => {
    if (dictionaries[lang]) {
      setLanguageState(lang);
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.LANGUAGE, lang);
    }
  };

  const t = (path, replacements = {}) => {
    const keys = path.split('.');
    let current = dictionaries[language] || dictionaries.bhs;

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return path; // Fallback to key
      }
    }

    if (typeof current !== 'string') return path;

    let result = current;
    for (const [k, v] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`{{${k}}}`, 'g'), v);
    }
    return result;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
