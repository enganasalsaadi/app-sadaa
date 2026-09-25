import type { AppConfig } from '@/core/api';
import { configApi } from '@/core/api';
import { appStorage, StorageKeys } from '@/core/storage';
import type { AppDispatch } from '@/app/store';
import type { BootConfig } from '../types';

const isAppConfig = (value: unknown): value is AppConfig =>
  typeof value === 'object' && value !== null;

const readCache = (): AppConfig | null => {
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

/** GET /config (3s timeout, silent). On failure falls back to the last cached copy — never throws. */
export const loadBootConfig = async (dispatch: AppDispatch): Promise<BootConfig> => {
  const request = dispatch(configApi.endpoints.getConfig.initiate());
  try {
    const config = await request.unwrap();
    appStorage.set(StorageKeys.APP_CONFIG_CACHE, JSON.stringify(config));
    return { config, isFresh: true };
  } catch {
    return { config: readCache(), isFresh: false };
  } finally {
    request.unsubscribe();
  }
};
