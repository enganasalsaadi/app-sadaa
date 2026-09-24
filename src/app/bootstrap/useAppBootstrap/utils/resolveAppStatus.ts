import { appStorage, StorageKeys } from '@/core/storage';
import { authStorage } from '@/core/storage';
import { AppStatus } from '../types';

export const resolveAppStatus = (): AppStatus => {
  try {
    const hasChosenLanguage = appStorage.get(StorageKeys.HAS_CHOSEN_LANGUAGE);
    if (hasChosenLanguage !== 'true') {
      return AppStatus.CHOOSE_LANGUAGE;
    }

    const token = authStorage.getToken();
    if (token) {
      return AppStatus.AUTHENTICATED;
    }

    return AppStatus.UNAUTHENTICATED;
  } catch {
    return AppStatus.CHOOSE_LANGUAGE;
  }
};
