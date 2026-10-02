import type { ParseKeys } from 'i18next';
import type { FollowerTierId } from '@/core/config';

/** Short badge label — never the server `label_ar/en` (that one reads "نانو (Nano)"). */
export const TIER_NAME_KEY = {
  NANO: 'followerTier.NANO',
  MICRO: 'followerTier.MICRO',
  MID_TIER: 'followerTier.MID_TIER',
  MACRO: 'followerTier.MACRO',
  MEGA: 'followerTier.MEGA',
} as const satisfies Record<FollowerTierId, ParseKeys>;

/** One-line explainer shown in `TierInfoSheet`. */
export const TIER_DESCRIPTION_KEY = {
  NANO: 'followerTier.descriptions.NANO',
  MICRO: 'followerTier.descriptions.MICRO',
  MID_TIER: 'followerTier.descriptions.MID_TIER',
  MACRO: 'followerTier.descriptions.MACRO',
  MEGA: 'followerTier.descriptions.MEGA',
} as const satisfies Record<FollowerTierId, ParseKeys>;
