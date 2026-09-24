import { appStorage } from './storage';
import { StorageKeys } from './storageKeys';

export const authStorage = {
  getToken: () => appStorage.get(StorageKeys.USER_TOKEN),
  getRefreshToken: () => appStorage.get(StorageKeys.REFRESH_TOKEN),
  saveToken: (token: string) => appStorage.set(StorageKeys.USER_TOKEN, token),
  saveRefreshToken: (token: string) =>
    appStorage.set(StorageKeys.REFRESH_TOKEN, token),
  clearTokens: async () => {
    appStorage.delete(StorageKeys.USER_TOKEN);
    appStorage.delete(StorageKeys.REFRESH_TOKEN);
  },
  clearCart: async () => {
  },
};
