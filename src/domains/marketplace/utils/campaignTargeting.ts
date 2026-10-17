import { CAMPAIGN_GENDER } from '../types/campaign';
import type { CampaignGender } from '../types/campaign';

/** A gender pick list reduced to the values the server knows, in their fixed order. */
export const pickGenders = (picked: readonly string[]): CampaignGender[] =>
  CAMPAIGN_GENDER.filter(gender => picked.includes(gender));

/** Tapping the chosen follower floor again clears it (no floor). */
export const toggleFollowerFloor = (current: number | null, picked: number): number | null =>
  current === picked ? null : picked;
