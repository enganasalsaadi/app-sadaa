import { extractServerFieldErrors } from '@/core/api';
import type { AppApiError } from '@/core/api';
import { toAmountText } from '@/core/money';
import type { Money } from '@/core/money';
import type { PlatformResource } from '@/domains/auth';
import type {
  CampaignApplyArgs,
  CampaignLabel,
  CampaignMoneyBreakdown,
  CreatorCampaignDeliverable,
} from '../types/campaign';

/** A bid below this is refused by the server (contract §4.2). */
export const BID_MIN: Money = { amount: 500, currency: 'USD' };
/** The − and + on the bid move by one dollar. */
export const BID_STEP = 100;
export const PITCH_MAX = 500;
const BPS = 10_000;

/**
 * The creator's take-home for a bid, from the campaign's fee: a preview, always labelled estimate
 * (rule 06). The exact figures come back with the application.
 */
export const estimateNet = (gross: Money, feeBps: number): CampaignMoneyBreakdown => {
  const fee = Math.round((gross.amount * feeBps) / BPS);
  return {
    gross,
    fee: { amount: fee, currency: gross.currency },
    net: { amount: gross.amount - fee, currency: gross.currency },
  };
};

export type BidIssue = 'empty' | 'low' | 'high';

/** `max` is binding; the campaign's own minimum is only a guide, so only `BID_MIN` is a floor. */
export const bidIssue = (bid: Money | null, max: Money): BidIssue | null => {
  if (!bid || bid.amount <= 0) return 'empty';
  if (bid.amount < BID_MIN.amount) return 'low';
  return bid.amount > max.amount ? 'high' : null;
};

/** Where the bid starts: the suggested minimum, kept inside what is allowed. */
export const defaultBid = (suggestedMin: Money, max: Money): Money => ({
  amount: Math.min(Math.max(suggestedMin.amount, BID_MIN.amount), max.amount),
  currency: max.currency,
});

/** 0–1 along the ruler from `BID_MIN` to `max`. */
export const rulerPosition = (amount: number, max: Money): number => {
  const span = max.amount - BID_MIN.amount;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (amount - BID_MIN.amount) / span));
};

/** The platforms a campaign asks for, once each, in the order it lists them. */
export const requiredPlatforms = (deliverables: readonly CreatorCampaignDeliverable[]): CampaignLabel[] => {
  const seen = new Set<string>();
  return deliverables.flatMap(({ platform }) => {
    if (seen.has(platform.key)) return [];
    seen.add(platform.key);
    return [platform];
  });
};

export type AccountBlock =
  | { kind: 'followers'; min: number }
  | { kind: 'review' }
  | { kind: 'rejected' }
  | { kind: 'unavailable' };

export interface AccountChoice {
  account: PlatformResource;
  /** Why the account can't be used for this campaign; `null` = pickable. */
  block: AccountBlock | null;
}

const blockOf = (account: PlatformResource, minFollowers: number | null): AccountBlock | null => {
  if (account.verification_status === 'rejected') return { kind: 'rejected' };
  if (account.verification_status === 'pending_review') return { kind: 'review' };
  if (!account.is_available) return { kind: 'unavailable' };
  // A manual platform has no count; the server is the one to judge it.
  if (minFollowers !== null && account.follower_count !== null && account.follower_count < minFollowers) {
    return { kind: 'followers', min: minFollowers };
  }
  return null;
};

/** The creator's accounts on one platform, the primary first; each says whether it can apply. */
export const accountChoices = (
  platformKey: string,
  accounts: readonly PlatformResource[],
  minFollowers: number | null,
): AccountChoice[] =>
  accounts
    .filter(account => account.platform === platformKey)
    .map(account => ({ account, block: blockOf(account, minFollowers) }))
    .sort((a, b) => Number(b.account.is_primary) - Number(a.account.is_primary));

/** Each required platform starts on its first usable account (the primary one, when it can apply). */
export const defaultAccounts = (
  platforms: readonly CampaignLabel[],
  accounts: readonly PlatformResource[],
  minFollowers: number | null,
): Record<string, string> => {
  const picked: Record<string, string> = {};
  platforms.forEach(({ key }) => {
    const first = accountChoices(key, accounts, minFollowers).find(choice => !choice.block);
    if (first) picked[key] = first.account.id;
  });
  return picked;
};

/** Wire body of `POST /influencer/campaigns/{id}/apply`: a blank pitch and a fixed price's bid are left out. */
export const toApplyBody = ({ pitch, bid, accounts, deviceId }: CampaignApplyArgs) => {
  const text = pitch.trim();
  return {
    ...(text ? { pitch: text } : {}),
    ...(bid ? { bid_usd: toAmountText(bid) } : {}),
    accounts,
    device_id: deviceId,
  };
};

export interface ApplyFieldErrors {
  bid: string | null;
  /** Platform key → the server's words. */
  accounts: Record<string, string>;
}

const ACCOUNT_PREFIX = 'accounts.';

/** The 422 field map (`bid_usd`, `accounts.<platform>`) as the sheet shows it; `null` when none of it is ours. */
export const applyFieldErrors = (error: unknown): ApplyFieldErrors | null => {
  const raw = extractServerFieldErrors(error);
  if (!raw) return null;
  const result: ApplyFieldErrors = { bid: raw.bid_usd ?? null, accounts: {} };
  Object.entries(raw).forEach(([key, message]) => {
    if (key.startsWith(ACCOUNT_PREFIX)) result.accounts[key.slice(ACCOUNT_PREFIX.length)] = message;
  });
  return result.bid || Object.keys(result.accounts).length > 0 ? result : null;
};

/**
 * How a refused application ends (contract §4.2): the creator's own restriction and the profile
 * gap stay in the sheet as a banner, the limit too; a campaign that stopped accepting (or no longer
 * fits the creator) closes the sheet and says why; anything else is the server's message.
 */
export type ApplyRefusal =
  | { kind: 'restricted' | 'profile' | 'limit' | 'other'; message: string }
  | { kind: 'closed'; message: string };

export const applyRefusal = ({ code, message }: AppApiError): ApplyRefusal => {
  switch (code) {
    case 'creator_restricted':
      return { kind: 'restricted', message };
    case 'campaign_profile_incomplete':
      return { kind: 'profile', message };
    case 'campaign_application_limit':
      return { kind: 'limit', message };
    case 'campaign_not_accepting':
    case 'campaign_not_eligible':
      return { kind: 'closed', message };
    default:
      return { kind: 'other', message };
  }
};
