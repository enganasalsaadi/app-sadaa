import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {I18nManager} from 'react-native';
import {languageDetector} from './languageDetector';
import './types';
import {DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES} from '@/core/config';
import en from '../../assets/locales/en/common.json';
import ar from '../../assets/locales/ar/common.json';

export const isRTL = (lang: string): boolean =>
  (lang.split('-')[0] ?? '').toLowerCase() === 'ar';

export const syncRTL = (lang: string): void => {
  I18nManager.allowRTL(true);
  I18nManager.swapLeftAndRightInRTL(true);
  I18nManager.forceRTL(isRTL(lang));
};

export const resources = {
  en: {common: en},
  ar: {common: ar},
} as const;

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    compatibilityJSON: 'v4',
  });

const currentLang = i18n.language ?? DEFAULT_LANGUAGE;
syncRTL(currentLang);

export default i18n;
export { getValidLanguage } from './language';
export { formatNumber, formatMoney, formatDate } from './format';
