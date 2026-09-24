import {createMMKV} from 'react-native-mmkv';
import {MMKV_IDS, StorageKeys} from './storageKeys';
import type {StorageKey, StorageSchema} from './storageKeys';

const mmkv = createMMKV({
  id: MMKV_IDS.APP,
});

type ValueOf<K extends StorageKey> = StorageSchema[K];

export const appStorage = {
  get<K extends StorageKey>(key: K): ValueOf<K> | undefined {
    return mmkv.getString(key) as ValueOf<K> | undefined;
  },

  set<K extends StorageKey>(key: K, value: ValueOf<K>): void {
    mmkv.set(key, value as string);
  },

  delete(key: StorageKey): void {
    mmkv.remove(key);
  },

  contains(key: StorageKey): boolean {
    return mmkv.contains(key);
  },

  clearAll(): void {
    mmkv.clearAll();
  },
};

export {StorageKeys};
export type {StorageKey, StorageSchema};
