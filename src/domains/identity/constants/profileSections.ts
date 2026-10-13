import type { UserType } from '@/domains/auth';

/** Every block under the Profile hero; order per role lives in `PROFILE_SECTIONS`. */
export type ProfileSectionKey =
  | 'kycRejected'
  | 'completion'
  | 'push'
  | 'detailsError'
  | 'platforms'
  | 'creatorTools'
  | 'company'
  | 'brandVisibility'
  | 'settings'
  | 'account';

/** Add, drop or reorder a block here; the screen renders this list as-is. */
export const PROFILE_SECTIONS = {
  influencer: ['kycRejected', 'completion', 'push', 'detailsError', 'platforms', 'creatorTools', 'settings', 'account'],
  brand: ['kycRejected', 'completion', 'push', 'detailsError', 'company', 'brandVisibility', 'settings', 'account'],
} as const satisfies Record<UserType, readonly ProfileSectionKey[]>;
