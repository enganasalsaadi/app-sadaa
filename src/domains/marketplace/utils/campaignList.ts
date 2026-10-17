import { CAMPAIGN_MISSING_KEY } from '../types/campaignDraft';
import type { Campaign } from '../types';
import { getCampaignStatusMeta } from './campaignStatus';

/** What waits on the brand in a campaign's row (list rows carry no `timers`, so nothing time-based). */
export const CAMPAIGN_ATTENTION_KIND = ['suspended', 'seat_freed', 'changes_requested'] as const;
export type CampaignAttentionKind = (typeof CAMPAIGN_ATTENTION_KIND)[number];

export interface CampaignAttention {
  campaign: Campaign;
  kind: CampaignAttentionKind;
}

export const campaignAttentionKind = (campaign: Campaign): CampaignAttentionKind | null => {
  const { key } = campaign.status;
  if (key === 'suspended') return 'suspended';
  if (key === 'changes_requested') return 'changes_requested';
  if (campaign.seatFreed && getCampaignStatusMeta(key).tab === 'live') return 'seat_freed';
  return null;
};

/** Most urgent first: a suspension cancels itself, a freed seat blocks recruiting, edits wait on the brand only. */
export const buildCampaignAttention = (campaigns: readonly Campaign[]): CampaignAttention[] => {
  const seen = new Set<string>();
  const found: CampaignAttention[] = [];
  campaigns.forEach(campaign => {
    const kind = campaignAttentionKind(campaign);
    if (kind === null || seen.has(campaign.id)) return;
    seen.add(campaign.id);
    found.push({ campaign, kind });
  });
  return found.sort(
    (a, b) => CAMPAIGN_ATTENTION_KIND.indexOf(a.kind) - CAMPAIGN_ATTENTION_KIND.indexOf(b.kind),
  );
};

export interface CampaignReadiness {
  done: number;
  total: number;
}

/** The draft's parts that are filled: `missing[]` names what still blocks Submit. */
export const campaignReadiness = ({ missing }: Pick<Campaign, 'missing'>): CampaignReadiness => {
  const total = CAMPAIGN_MISSING_KEY.length;
  return { done: Math.max(0, total - missing.length), total };
};

/** «Applications waiting» over what has loaded; `null` while more pages exist (a partial sum would mislead). */
export const waitingApplications = (
  campaigns: readonly Campaign[],
  hasMorePages: boolean,
): number | null =>
  hasMorePages ? null : campaigns.reduce((sum, c) => sum + c.counters.applicationsOpen, 0);

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export type CampaignTimeLeft =
  | { unit: 'days'; days: number; hours: number }
  | { unit: 'hours'; hours: number; minutes: number }
  | { unit: 'minutes'; minutes: number };

/** Recruiting time left, in the two biggest units; `null` once the deadline has passed or none is set. */
export const campaignTimeLeft = (endsAt: number | null, now: number): CampaignTimeLeft | null => {
  if (endsAt === null || endsAt <= now) return null;
  const left = endsAt - now;
  if (left >= DAY) return { unit: 'days', days: Math.floor(left / DAY), hours: Math.floor((left % DAY) / HOUR) };
  if (left >= HOUR) return { unit: 'hours', hours: Math.floor(left / HOUR), minutes: Math.floor((left % HOUR) / MINUTE) };
  return { unit: 'minutes', minutes: Math.max(1, Math.ceil(left / MINUTE)) };
};
