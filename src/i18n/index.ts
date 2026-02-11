import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { en } from './locales/en';
import { es } from './locales/es';

export type TranslationKeys = typeof en;
export type Language = 'en' | 'es';

const translations: Record<Language, TranslationKeys> = { en, es };
const LANGUAGE_KEY = '@lumo_language';

const getDeviceLanguage = (): Language => {
  let locale = 'en';
  try {
    if (Platform.OS === 'ios') {
      locale = NativeModules.SettingsManager?.settings?.AppleLocale ||
               NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 'en';
    } else {
      locale = NativeModules.I18nManager?.localeIdentifier || 'en';
    }
  } catch (e) {
    locale = 'en';
  }
  const lang = locale.substring(0, 2).toLowerCase();
  return lang === 'es' ? 'es' : 'en';
};

let currentLanguage: Language = getDeviceLanguage();
let listeners: Array<(lang: Language) => void> = [];

export const i18n = {
  get language() {
    return currentLanguage;
  },
  
  async init() {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved === 'en' || saved === 'es') {
        currentLanguage = saved;
        listeners.forEach(fn => fn(currentLanguage));
      }
    } catch (e) {
      // Use default
    }
  },
  
  async setLanguage(lang: Language) {
    currentLanguage = lang;
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    listeners.forEach(fn => fn(lang));
  },
  
  subscribe(fn: (lang: Language) => void) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },
  
  t<K1 extends keyof TranslationKeys, K2 extends keyof TranslationKeys[K1]>(
    section: K1,
    key: K2
  ): string {
    return (translations[currentLanguage][section] as any)[key] || `${String(section)}.${String(key)}`;
  },
};

export { en, es };
