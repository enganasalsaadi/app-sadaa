import type { CampaignDetail, CampaignStatus } from '../types/campaign';
import type { Timestamp } from '../types/deal';
import { campaignMenuRows, type CampaignMenuAction } from './campaignLifecycle';

/** What a quick-action circle does: a «⋯» action, the one-tap reopen of a suspended campaign, or the applicants screen. */
export type CampaignQuickAction = CampaignMenuAction | 'reopen' | 'creators';

/** Circles that fit one row. */
export const CAMPAIGN_QUICK_MAX = 4;

/** Most useful first, per status. Ending is both words: the menu offers whichever one applies. */
const PREFERRED = {
  draft: ['resume', 'duplicate', 'delete'],
  changes_requested: ['resume', 'duplicate', 'cancel'],
  pending_review: ['duplicate'],
  open: ['extendDeadline', 'addSeats', 'edit', 'duplicate'],
  suspended: ['reopen', 'duplicate', 'close', 'cancel'],
  filled: ['creators', 'addSeats', 'edit', 'duplicate'],
  closed: ['creators', 'duplicate'],
  completed: ['duplicate'],
  cancelled: ['duplicate'],
  rejected: ['duplicate'],
  removed: ['duplicate'],
} as const satisfies Record<CampaignStatus, readonly CampaignQuickAction[]>;

/**
 * The circles under the cover: the few actions of the «⋯» a brand reaches for at this status, so
 * the common ones are one tap away. Only what can run now: a disabled row stays in the menu, with
 * its reason.
 */
export const campaignQuickActions = (campaign: CampaignDetail, now: Timestamp): CampaignQuickAction[] => {
  const status = campaign.status.key;
  const available = new Set<CampaignQuickAction>(
    campaignMenuRows(campaign, now)
      .filter(row => !row.disabled)
      .map(row => row.action),
  );
  if (status === 'suspended') available.add('reopen');
  if (campaign.counters.seatsOccupied > 0) available.add('creators');
  const preferred: readonly CampaignQuickAction[] = status === null ? ['duplicate'] : PREFERRED[status];
  return preferred.filter(action => available.has(action)).slice(0, CAMPAIGN_QUICK_MAX);
};

/** Actions that end or erase the campaign: drawn in the danger color. */
export const isDangerQuickAction = (action: CampaignQuickAction): boolean =>
  action === 'close' || action === 'cancel' || action === 'delete';
