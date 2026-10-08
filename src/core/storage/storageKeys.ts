export const MMKV_IDS = {
  APP: 'sadaa-storage',
  REDUX_PERSIST: 'sadaa-redux-persist',
  /** Encrypted (AES-256, key in Keychain/Keystore): session + PII keys. */
  SECURE: 'sadaa-secure',
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
  INFLUENCER_SOCIALS_DRAFT: 'auth.influencer_socials_draft',
  PUSH_DEVICE_SYNC: 'auth.push_device_sync',
  PUSH_PROMPT: 'app.push_prompt',
  RATE_CARD_CATALOG_CACHE: 'app.rate_card_catalog_cache',
  STORAGE_VERSION: 'app.storage_version',
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
  /** Unsaved creator niches + platforms (JSON), keyed to the registering phone. */
  [StorageKeys.INFLUENCER_SOCIALS_DRAFT]: string;
  /** Last `POST /user/devices` this session sent (JSON token + language + app version). */
  [StorageKeys.PUSH_DEVICE_SYNC]: string;
  /** Soft push prompt history (JSON shown count + last dismissal), per install. */
  [StorageKeys.PUSH_PROMPT]: string;
  /** Rate card catalog (JSON `{ [language]: { etag, catalog } }`): public reference data, no PII. */
  [StorageKeys.RATE_CARD_CATALOG_CACHE]: string;
  /** Layout of the on-disk stores; '2' once session + PII moved to the encrypted store. */
  [StorageKeys.STORAGE_VERSION]: string;
}

/**
 * Keys that identify the user or grant access: stored only in the encrypted
 * `sadaa-secure` instance. Everything else stays plain because it is read
 * before the Keychain key is loaded (language, theme) or identifies no one.
 */
export const SECURE_STORAGE_KEYS = [
  StorageKeys.USER_TOKEN,
  StorageKeys.REFRESH_TOKEN,
  StorageKeys.PENDING_USER_DATA,
  StorageKeys.INFLUENCER_SOCIALS_DRAFT,
  StorageKeys.PUSH_DEVICE_SYNC,
] as const satisfies readonly StorageKey[];

export type SecureStorageKey = (typeof SECURE_STORAGE_KEYS)[number];

export const isSecureStorageKey = (key: StorageKey): key is SecureStorageKey =>
  (SECURE_STORAGE_KEYS as readonly StorageKey[]).includes(key);
