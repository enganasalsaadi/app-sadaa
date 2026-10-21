import type { CountryCode } from 'libphonenumber-js';

export const DEFAULT_LANGUAGE = 'ar' as const;
export const DEFAULT_CURRENCY = 'USD' as const;
export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const MAX_SEARCH_HISTORY_ITEMS = 20;

export const APP_NAME = 'sadaa';

/** Pre-selected country in phone inputs (Syria-first). */
export const DEFAULT_PHONE_COUNTRY: CountryCode = 'SY';

/** Android vibration length for a light tap (ms) — short enough to feel like a click, not a buzz. */
export const HAPTIC_TAP_MS = 10;

/** Android vibration length for a success beat (a lock opening): a little firmer than a tap. */
export const HAPTIC_SUCCESS_MS = 24;
