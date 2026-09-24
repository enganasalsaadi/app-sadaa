import {createMMKV} from 'react-native-mmkv';
import {MMKV_IDS} from '@/core/storage';
import type {Storage} from 'redux-persist';

const persistMMKV = createMMKV({
  id: MMKV_IDS.REDUX_PERSIST,
});

export const mmkvReduxStorage: Storage = {
  setItem: (key: string, value: string): Promise<void> => {
    persistMMKV.set(key, value);
    return Promise.resolve();
  },
  getItem: (key: string): Promise<string | null> => {
    const value = persistMMKV.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key: string): Promise<void> => {
    persistMMKV.remove(key);
    return Promise.resolve();
  },
};
