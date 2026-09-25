import { appStorage, authStorage, StorageKeys } from '@/core/storage';
import { AppStatus } from '../../types';
import { resolveAppStatus } from '../resolveAppStatus';

describe('resolveAppStatus', () => {
  beforeEach(() => appStorage.clearAll());

  it('asks for language first', () => {
    appStorage.set(StorageKeys.HAS_SEEN_ONBOARDING, 'true');
    expect(resolveAppStatus()).toBe(AppStatus.CHOOSE_LANGUAGE);
  });

  it('shows onboarding after language when not seen', () => {
    appStorage.set(StorageKeys.HAS_CHOSEN_LANGUAGE, 'true');
    expect(resolveAppStatus()).toBe(AppStatus.ONBOARDING);
  });

  it('goes to auth once onboarding is seen and there is no token', () => {
    appStorage.set(StorageKeys.HAS_CHOSEN_LANGUAGE, 'true');
    appStorage.set(StorageKeys.HAS_SEEN_ONBOARDING, 'true');
    expect(resolveAppStatus()).toBe(AppStatus.UNAUTHENTICATED);
  });

  it('skips onboarding for a logged-in user', () => {
    appStorage.set(StorageKeys.HAS_CHOSEN_LANGUAGE, 'true');
    authStorage.saveToken('token');
    expect(resolveAppStatus()).toBe(AppStatus.AUTHENTICATED);
  });
});
