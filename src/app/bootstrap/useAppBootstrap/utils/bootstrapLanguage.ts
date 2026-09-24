import {I18nManager} from 'react-native';
import i18n from '@/core/i18n';
import {isRTL, syncRTL} from '@/core/i18n';
import { appStorage, StorageKeys } from '@/core/storage';
import { getValidLanguage } from '@/core/i18n';
import {DEFAULT_LANGUAGE} from '@/core/config';

export const bootstrapLanguage = (): string => {
  try {
    const stored = appStorage.get(StorageKeys.LANGUAGE);
    if (!stored) {
      return DEFAULT_LANGUAGE;
    }

    const lang = getValidLanguage(stored);

    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    if (I18nManager.isRTL !== isRTL(lang)) {
      syncRTL(lang);
    }

    return lang;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};
