export const MMKV_IDS = {
  APP: 'sadaa-storage',
  REDUX_PERSIST: 'sadaa-redux-persist',
} as const;

export const StorageKeys = {
  THEME_MODE: 'app.theme_mode',
  LANGUAGE: 'app.language',
  HAS_CHOSEN_LANGUAGE: 'app.has_chosen_language',
  HAS_SEEN_ONBOARDING: 'app.has_seen_onboarding',
  PUSH_TOKEN: 'app.push_token',
  DEVICE_ID_STORAGE_KEY: 'app.device_id',
  USER_TOKEN: 'auth.token',
  REFRESH_TOKEN: 'auth.refresh',
  PENDING_USER_DATA: 'auth.pending_user_data',
  APP_CONFIG_CACHE: 'app.config_cache',
  UPDATE_PROMPTED_VERSION: 'app.update_prompted_version',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

export interface StorageSchema {
  [StorageKeys.THEME_MODE]: string;
  [StorageKeys.LANGUAGE]: string;
  [StorageKeys.HAS_CHOSEN_LANGUAGE]: string;
  /** 'true' once intro slides are finished or skipped. */
  [StorageKeys.HAS_SEEN_ONBOARDING]: string;
  [StorageKeys.PUSH_TOKEN]: string;
  [StorageKeys.DEVICE_ID_STORAGE_KEY]: string;
  [StorageKeys.USER_TOKEN]: string;
  [StorageKeys.REFRESH_TOKEN]: string;
  [StorageKeys.PENDING_USER_DATA]: string;
  /** Last successful GET /config (JSON) — offline fallback for the version gate. */
  [StorageKeys.APP_CONFIG_CACHE]: string;
  /** latest_version already announced by the soft-update toast. */
  [StorageKeys.UPDATE_PROMPTED_VERSION]: string;
}
