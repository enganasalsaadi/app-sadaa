import type { AppConfig } from '@/core/api';

export enum AppStatus {
  LOADING = 'LOADING',
  /** Server-side maintenance (fresh /config only). Blocks every other branch. */
  MAINTENANCE = 'MAINTENANCE',
  /** Installed version below min_version (or force_update). Blocks every other branch. */
  UPDATE_REQUIRED = 'UPDATE_REQUIRED',
  CHOOSE_LANGUAGE = 'CHOOSE_LANGUAGE',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  AUTHENTICATED = 'AUTHENTICATED',
}

export type BootGateStatus = AppStatus.MAINTENANCE | AppStatus.UPDATE_REQUIRED;

export interface BootGate {
  /** Blocking status, or null when the app may continue. */
  blocked: BootGateStatus | null;
  /** latest_version when a newer, non-mandatory release exists. */
  softUpdateVersion: string | null;
}

export interface BootConfig {
  config: AppConfig | null;
  /** true = fetched this launch; false = cached copy from a previous launch (or none). */
  isFresh: boolean;
}

export interface BootstrapState {
  status: AppStatus;
  isReady: boolean;
  config: AppConfig | null;
}
