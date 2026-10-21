import { appStorage, StorageKeys } from '@/core/storage';
import type { AppConfig } from './configApi';

const isAppConfig = (value: unknown): value is AppConfig =>
  typeof value === 'object' && value !== null;

/** Last good `/config`, kept so a cold start offline (and the first form render) still knows the markets. */
export const readCachedAppConfig = (): AppConfig | null => {
  const raw = appStorage.get(StorageKeys.APP_CONFIG_CACHE);
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isAppConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeCachedAppConfig = (config: AppConfig): void => {
  appStorage.set(StorageKeys.APP_CONFIG_CACHE, JSON.stringify(config));
};
