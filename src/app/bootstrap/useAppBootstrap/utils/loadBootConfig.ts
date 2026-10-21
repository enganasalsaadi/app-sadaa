import { configApi, readCachedAppConfig, writeCachedAppConfig } from '@/core/api';
import type { AppDispatch } from '@/app/store';
import type { BootConfig } from '../types';

/** GET /config (3s timeout, silent). On failure falls back to the last cached copy — never throws. */
export const loadBootConfig = async (dispatch: AppDispatch): Promise<BootConfig> => {
  const request = dispatch(configApi.endpoints.getConfig.initiate());
  try {
    const config = await request.unwrap();
    writeCachedAppConfig(config);
    return { config, isFresh: true };
  } catch {
    return { config: readCachedAppConfig(), isFresh: false };
  } finally {
    request.unsubscribe();
  }
};
