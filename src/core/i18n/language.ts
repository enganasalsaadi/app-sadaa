import {DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES} from '@/core/config';
import type {SupportedLanguage} from '@/core/config';

/**
 * Validates and normalizes a raw language value from storage or user input.
 * Returns DEFAULT_LANGUAGE when the value is missing, empty, or unsupported.
 */
export const getValidLanguage = (raw: string | undefined | null): SupportedLanguage => {
  if (!raw || typeof raw !== 'string') {
    return DEFAULT_LANGUAGE;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return DEFAULT_LANGUAGE;
  }

  const base = (trimmed.split('-')[0] ?? '').toLowerCase();

  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(base)) {
    return base as SupportedLanguage;
  }

  return DEFAULT_LANGUAGE;
};
