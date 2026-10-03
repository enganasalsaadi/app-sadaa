import { createMigrate } from 'redux-persist';
import type { MigrationManifest, PersistConfig, PersistedState } from 'redux-persist';
import { mmkvReduxStorage } from './mmkvStorage';
import type { AuthState } from '@/domains/auth';

const authMigrations: MigrationManifest = {
  // v2: the access token lives only in `authStorage`; drop the old persisted copy.
  2: state => {
    if (!state) return state;
    const next: PersistedState & Partial<AuthState> = { ...state };
    delete next.token;
    return next;
  },
};

export const authPersistConfig: PersistConfig<AuthState> = {
  key: 'auth',
  version: 2,
  storage: mmkvReduxStorage,
  migrate: createMigrate(authMigrations, { debug: false }),
  // `token` is restored from `authStorage` at boot (`restoreToken`), never persisted twice.
  whitelist: [
    'user',
    'userType',
    'currentStep',
    'isOnboardingComplete',
    'pendingPhone',
    'phoneOtpSentAt',
    'isSuspended',
  ],
};
