import { appStorage, authStorage, StorageKeys } from '@/core/storage';
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

    // Logged-in users skip it: onboarding is a pre-auth intro only.
    if (appStorage.get(StorageKeys.HAS_SEEN_ONBOARDING) !== 'true') {
      return AppStatus.ONBOARDING;
    }

    return AppStatus.UNAUTHENTICATED;
  } catch {
    return AppStatus.CHOOSE_LANGUAGE;
  }
};
