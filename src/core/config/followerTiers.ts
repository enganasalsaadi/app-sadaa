import type { HueTone } from '@/core/theme';

/** Mirrors backend FollowerTierEnum, ordered smallest → largest. */
export const FOLLOWER_TIERS = ['NANO', 'MICRO', 'MID_TIER', 'MACRO', 'MEGA'] as const;
export type FollowerTierId = (typeof FOLLOWER_TIERS)[number];

export const FOLLOWER_TIER_LEVELS = 5;

/**
 * Tier ladder inside the brand palette (rule 08): neutral → teal → navy,
 * with mustard kept for MEGA, the only "top creator" tier. `level` escalates
 * the crest glyph (chevrons → star → crown) so tiers never differ by color alone.
 */
export const FOLLOWER_TIER_STYLE = {
  NANO: { tone: 'neutral', level: 1 },
  MICRO: { tone: 'interactive', level: 2 },
  MID_TIER: { tone: 'interactive', level: 3 },
  MACRO: { tone: 'brand', level: 4 },
  MEGA: { tone: 'premium', level: 5 },
} as const satisfies Record<FollowerTierId, { tone: HueTone; level: number }>;
