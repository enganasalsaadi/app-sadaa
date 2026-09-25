import type { AppConfig } from '@/core/api';
import { compareVersions } from '@/shared/utils';
import { AppStatus } from '../types';
import type { BootGate } from '../types';

const OPEN: BootGate = { blocked: null, softUpdateVersion: null };

/**
 * Fail-open: no config → no gate. Maintenance only from a fresh config — a cached
 * flag could lock users out after maintenance ended (the server still answers 503).
 * The version gate also trusts the cache, since min_version only moves forward.
 */
export const resolveBootGate = (
  config: AppConfig | null,
  isFresh: boolean,
  currentVersion: string,
): BootGate => {
  if (!config) {
    return OPEN;
  }

  if (isFresh && config.maintenance_mode) {
    return { blocked: AppStatus.MAINTENANCE, softUpdateVersion: null };
  }

  const app = config.app;
  if (!app) {
    return OPEN;
  }

  const belowMin = !!app.min_version && compareVersions(currentVersion, app.min_version) < 0;
  const behindLatest = !!app.latest_version && compareVersions(currentVersion, app.latest_version) < 0;

  if (belowMin || (app.force_update && behindLatest)) {
    return { blocked: AppStatus.UPDATE_REQUIRED, softUpdateVersion: null };
  }

  return { blocked: null, softUpdateVersion: behindLatest ? app.latest_version : null };
};
