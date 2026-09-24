import type { SupportedLanguage } from '@/core/config';

export type LanguageCardAlign = 'flex-start' | 'flex-end';

export interface LanguageOption {
  id: SupportedLanguage;
  align: LanguageCardAlign;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'ar', align: 'flex-start' },
  { id: 'en', align: 'flex-end' },
];
