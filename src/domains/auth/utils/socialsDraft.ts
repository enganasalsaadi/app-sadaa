import { appStorage, StorageKeys } from '@/core/storage';
import { isFollowerTier, isInfluencerPlatform } from '../schemas';
import type { InfluencerSocialsFormValues, PlatformAccountFormValues } from '../schemas';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// Drafts saved before the `handle` rename stored `username` and no tier
// source: those tiers were all picked by hand. Only a found lookup may lack a tier.
const toAccount = (value: unknown): PlatformAccountFormValues[] => {
  if (!isRecord(value)) return [];
  const { platform, followerTier, isPrimary } = value;
  const handle = value.handle ?? value.username;
  const tierSource = value.tierSource === 'auto' ? 'auto' : 'manual';
  const tier = typeof followerTier === 'string' && isFollowerTier(followerTier) ? followerTier : null;
  return typeof platform === 'string' &&
    isInfluencerPlatform(platform) &&
    typeof handle === 'string' &&
    (tier !== null || tierSource === 'auto')
    ? [{ platform, handle, followerTier: tier, tierSource, isPrimary: isPrimary === true }]
    : [];
};

/** Parses the stored draft; anything malformed or from another phone is ignored. */
export const parseSocialsDraft = (
  raw: string | undefined,
  phone: string | null | undefined,
): InfluencerSocialsFormValues | null => {
  if (!raw || !phone) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.phone !== phone) return null;
    const { niches, platforms } = parsed;
    return {
      niches: Array.isArray(niches) ? niches.filter((n): n is string => typeof n === 'string') : [],
      platforms: Array.isArray(platforms) ? platforms.flatMap(toAccount) : [],
    };
  } catch {
    return null;
  }
};

/** Survives back-navigation, backgrounding and restarts until step-2 is saved. */
export const socialsDraftStorage = {
  load: (phone: string | null | undefined) =>
    parseSocialsDraft(appStorage.get(StorageKeys.INFLUENCER_SOCIALS_DRAFT), phone),
  save: (phone: string, values: InfluencerSocialsFormValues) =>
    appStorage.set(StorageKeys.INFLUENCER_SOCIALS_DRAFT, JSON.stringify({ phone, ...values })),
  clear: () => appStorage.delete(StorageKeys.INFLUENCER_SOCIALS_DRAFT),
};
