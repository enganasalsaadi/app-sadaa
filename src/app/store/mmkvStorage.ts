import { getReduxPersistMMKV } from '@/core/storage';
import type { Storage } from 'redux-persist';

// Encrypted with the Keychain key: every call waits for it (PersistGate holds the UI meanwhile).
export const mmkvReduxStorage: Storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    (await getReduxPersistMMKV()).set(key, value);
  },
  getItem: async (key: string): Promise<string | null> =>
    (await getReduxPersistMMKV()).getString(key) ?? null,
  removeItem: async (key: string): Promise<void> => {
    (await getReduxPersistMMKV()).remove(key);
  },
};
