import type { PersistConfig } from 'redux-persist';
import { mmkvReduxStorage } from './mmkvStorage';
import type { AuthState } from '@/domains/auth';

export const authPersistConfig: PersistConfig<AuthState> = {
  key: 'auth',
  version: 1,
  storage: mmkvReduxStorage,
  whitelist: ['user', 'token'],
};
