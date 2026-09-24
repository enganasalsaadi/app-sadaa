export const DEFAULT_LANGUAGE = 'ar' as const;
export const DEFAULT_CURRENCY = 'USD' as const;
export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const MAX_SEARCH_HISTORY_ITEMS = 20;

export const APP_NAME = 'sadaa';
