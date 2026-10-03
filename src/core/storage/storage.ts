import type { MMKV } from 'react-native-mmkv';
import { plainMMKV } from './plainMMKV';
import { getSecureMMKV } from './secureStorage';
import { isSecureStorageKey, StorageKeys } from './storageKeys';
import type { StorageKey, StorageSchema } from './storageKeys';

type ValueOf<K extends StorageKey> = StorageSchema[K];

// Session + PII keys resolve to the encrypted store; callers never choose.
const storeFor = (key: StorageKey): MMKV | null =>
  isSecureStorageKey(key) ? getSecureMMKV() : plainMMKV;

export const appStorage = {
  get<K extends StorageKey>(key: K): ValueOf<K> | undefined {
    return storeFor(key)?.getString(key) as ValueOf<K> | undefined;
  },

  set<K extends StorageKey>(key: K, value: ValueOf<K>): void {
    storeFor(key)?.set(key, value as string);
  },

  delete(key: StorageKey): void {
    storeFor(key)?.remove(key);
  },

  contains(key: StorageKey): boolean {
    return storeFor(key)?.contains(key) ?? false;
  },

  clearAll(): void {
    plainMMKV.clearAll();
    getSecureMMKV()?.clearAll();
  },
};

export { StorageKeys };
export type { StorageKey, StorageSchema };
