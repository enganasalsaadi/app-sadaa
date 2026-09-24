import type {LanguageDetectorModule} from 'i18next';
import { appStorage, StorageKeys } from '@/core/storage';
import { getValidLanguage } from './language';

export const languageDetector: LanguageDetectorModule = {
  type: 'languageDetector',

  init: () => {},

  detect: (): string => {
    return getValidLanguage(appStorage.get(StorageKeys.LANGUAGE));
  },

  cacheUserLanguage: (lng: string): void => {
    appStorage.set(StorageKeys.LANGUAGE, lng);
  },
};
