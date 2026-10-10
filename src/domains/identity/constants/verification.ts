import type { ParseKeys } from 'i18next';
import type { SocialProofPlatform } from '../types/verification';

export const SOCIAL_PROOF_PLATFORM_LABEL = {
  instagram: 'account.verification.social.form.platforms.instagram',
  facebook: 'account.verification.social.form.platforms.facebook',
} as const satisfies Record<SocialProofPlatform, ParseKeys>;

/**
 * Page hosts the server accepts per platform (contract route 2): stricter than the
 * profile-link allow-list, which also takes short links (`instagr.am`, `fb.me`).
 */
export const SOCIAL_PROOF_HOSTS = {
  instagram: ['instagram.com', 'www.instagram.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.com'],
} as const satisfies Record<SocialProofPlatform, readonly string[]>;

/** Shown under the page link field. */
export const SOCIAL_PROOF_URL_EXAMPLE = {
  instagram: 'instagram.com/yourstore',
  facebook: 'facebook.com/yourstore',
} as const satisfies Record<SocialProofPlatform, string>;

/**
 * Hosts the server's `deep_link` may point at (Sada's profile, or Messenger with the code
 * prefilled). Anything else is never opened: the screen falls back to the plain instructions.
 */
export const SOCIAL_PROOF_DEEP_LINK_HOSTS = {
  instagram: ['instagram.com', 'www.instagram.com'],
  facebook: [
    'm.me',
    'facebook.com',
    'www.facebook.com',
    'm.facebook.com',
    'fb.com',
  ],
} as const satisfies Record<SocialProofPlatform, readonly string[]>;

/** Opened when Sada's official account isn't configured yet (`deep_link: null`). */
export const SOCIAL_PROOF_APP_URL = {
  instagram: 'https://www.instagram.com/',
  facebook: 'https://www.facebook.com/',
} as const satisfies Record<SocialProofPlatform, string>;

/** Social proof status is checked this often while the screen is focused and the code is pending. */
export const SOCIAL_PROOF_POLL_MS = 60_000;

/** Contract limits for `page_url`, `domain` and `email`. */
export const VERIFICATION_FIELD_MAX_LENGTH = 255;

/**
 * Common public mail providers, rejected before the request for a faster error.
 * The full list lives on the server, which re-checks (422 on `domain`).
 */
export const PUBLIC_EMAIL_DOMAINS: readonly string[] = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'yandex.com',
  'mail.ru',
];
