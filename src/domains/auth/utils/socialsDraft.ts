import { appStorage, StorageKeys } from '@/core/storage';
import { isFollowerTier, isInfluencerPlatform } from '../schemas';
import type { InfluencerSocialsFormValues, PlatformAccountFormValues } from '../schemas';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toAccount = (value: unknown): PlatformAccountFormValues[] => {
  if (!isRecord(value)) return [];
  const { platform, username, followerTier } = value;
  return typeof platform === 'string' &&
    isInfluencerPlatform(platform) &&
    typeof username === 'string' &&
    typeof followerTier === 'string' &&
    isFollowerTier(followerTier)
    ? [{ platform, username, followerTier }]
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
