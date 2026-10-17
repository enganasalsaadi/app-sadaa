import type { ParseKeys } from 'i18next';
import type { DealStrikeReason } from '../types';

/** Only for a strike the server sent without a label; the server's own words always win. */
export const DEAL_STRIKE_REASON_FALLBACK = {
  withdrew: 'marketplace.deals.strikes.reasons.withdrew',
  defaulted: 'marketplace.deals.strikes.reasons.defaulted',
  dispute_lost: 'marketplace.deals.strikes.reasons.dispute_lost',
  retention_violation: 'marketplace.deals.strikes.reasons.retention_violation',
  return_overdue: 'marketplace.deals.strikes.reasons.return_overdue',
} as const satisfies Record<DealStrikeReason, ParseKeys>;
