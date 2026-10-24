import type { SocialPlatform } from '@/shared/utils';
import type { MediaKitPlatform, PublicMediaKit } from '../types/mediaKit';

/** One platform on the stage: its slice of the follower bar and its tile. */
export interface StagePlatform {
  platform: SocialPlatform;
  label: string;
  followers: number;
  verified: boolean;
  /** Whole percent of all followers; `0` when nobody follows anywhere yet. */
  sharePct: number;
}

export interface StageReach {
  total: number;
  /** Primary platform first, then the biggest audiences. */
  platforms: StagePlatform[];
}

/** Total followers and each platform's share, for the hero's reach line and tiles. */
export const buildStageReach = (platforms: readonly MediaKitPlatform[]): StageReach => {
  const total = platforms.reduce((sum, item) => sum + Math.max(item.follower_count, 0), 0);
  const ordered = [...platforms].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || b.follower_count - a.follower_count,
  );
  return {
    total,
    platforms: ordered.map(item => ({
      platform: item.platform,
      label: item.platform_label,
      followers: item.follower_count,
      verified: item.follower_count_verified,
      sharePct: total > 0 ? Math.round((Math.max(item.follower_count, 0) / total) * 100) : 0,
    })),
  };
};

/** The handle under the name: the primary platform's, else the first linked one. */
export const stageHandle = (platforms: readonly MediaKitPlatform[]): string | null => {
  const primary = platforms.find(item => item.is_primary) ?? platforms[0];
  return primary ? primary.username : null;
};

/** Platform tiles per row: one centred, two side by side, more in a 2-wide grid. */
export const stageGridColumns = (count: number): 1 | 2 => (count <= 1 ? 1 : 2);

/** The stage's reputation strip; each part `null` when the server has too little history. */
export interface StageReputation {
  rating: { average: number; count: number } | null;
  /** Whole percent 0–100. */
  completion: { rate: number; count: number } | null;
  /** Server-localized, shown as-is. */
  response: string | null;
}

const RATING_MAX = 5;
const PERCENT_MAX = 100;

/** Validates the raw kit fields (malformed → dropped, never shown wrong); all `null` → no strip. */
export const buildStageReputation = (
  kit: Pick<PublicMediaKit, 'rating' | 'completion' | 'response'>,
): StageReputation | null => {
  const { rating, completion, response } = kit;
  const reputation: StageReputation = {
    rating:
      rating && Number.isFinite(rating.average) && rating.average >= 0 && rating.average <= RATING_MAX && rating.count > 0
        ? { average: rating.average, count: rating.count }
        : null,
    completion:
      completion && Number.isFinite(completion.rate) && completion.rate >= 0 && completion.rate <= PERCENT_MAX && completion.count > 0
        ? { rate: Math.floor(completion.rate), count: completion.count }
        : null,
    response: response?.label?.trim() ? response.label.trim() : null,
  };
  return reputation.rating || reputation.completion || reputation.response ? reputation : null;
};
