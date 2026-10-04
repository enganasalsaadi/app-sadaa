import type { UserType } from '@/domains/auth';

/** Every card the Profile screen can render; order per role lives in `PROFILE_SECTIONS`. */
export type ProfileSectionKey =
  | 'completion'
  | 'push'
  | 'kyc'
  | 'platforms'
  | 'niches'
  | 'company'
  | 'settings'
  | 'account';

/** Add, drop or reorder a card here; the screen renders this list as-is. */
export const PROFILE_SECTIONS = {
  influencer: ['completion', 'push', 'kyc', 'platforms', 'niches', 'settings', 'account'],
  brand: ['completion', 'push', 'kyc', 'company', 'settings', 'account'],
} as const satisfies Record<UserType, readonly ProfileSectionKey[]>;
