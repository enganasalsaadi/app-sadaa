import type { TimelineStepState } from '@/shared/ui';
import {
  DEAL_ITEM_ACTIONS,
  DEAL_ITEM_STATUS_META,
  DEAL_PHASES,
  DEAL_STATUS_ACTIONS,
  DEAL_STATUS_META,
  UNKNOWN_DEAL_ITEM_STATUS_META,
  UNKNOWN_DEAL_STATUS_META,
} from '../constants/dealStatus';
import type { DealItemStatusMeta, DealPhase, DealStatusMeta } from '../constants/dealStatus';
import type {
  Deal,
  DealAction,
  DealItem,
  DealItemAction,
  DealItemStatus,
  DealRole,
  DealStatus,
} from '../types';

/** `null` = a status the app doesn't know (mappers turn raw values into `null` at the API edge). */
export const getDealStatusMeta = (status: DealStatus | null): DealStatusMeta =>
  status === null ? UNKNOWN_DEAL_STATUS_META : DEAL_STATUS_META[status];

export const getDealItemStatusMeta = (status: DealItemStatus | null): DealItemStatusMeta =>
  status === null ? UNKNOWN_DEAL_ITEM_STATUS_META : DEAL_ITEM_STATUS_META[status];

export type DealActionInput = Pick<
  Deal,
  | 'status'
  | 'cancellation'
  | 'shipping'
  | 'dispute'
  | 'disputeWindow'
  | 'upsells'
  | 'upsellWindow'
  | 'rating'
  | 'retention'
  | 'retentionCases'
  | 'onHold'
>;

/**
 * Which action surfaces the deal detail shows for this role. UX hint only — the server
 * re-validates every call (rule 06). `now` (epoch ms) only gates the free shipping cancel.
 */
export const getDealActions = (
  deal: DealActionInput,
  role: DealRole,
  now: number = Date.now(),
): DealAction[] => {
  // Account hold: both sides are read-only until Sada resumes the deal (every action answers 409).
  if (deal.onHold) return [];
  const status = deal.status.key;
  const actions: DealAction[] = status === null ? [] : [...DEAL_STATUS_ACTIONS[status][role]];
  const brand = role === 'brand';

  if (brand && deal.cancellation?.brand) actions.push('cancel');
  if (!brand && deal.cancellation?.creator.withdrawAvailable) actions.push('withdraw');

  const freeCancelFrom = deal.shipping?.freeCancelFrom ?? null;
  if (
    !brand &&
    (status === 'product_shipping' || status === 'shipping_issue') &&
    freeCancelFrom !== null &&
    freeCancelFrom <= now
  ) {
    actions.push('freeCancel');
  }

  if (brand && deal.upsellWindow.open) actions.push('proposeUpsell');
  if (!brand && deal.upsells.some(upsell => upsell.status.key === 'pending')) actions.push('answerUpsell');

  if (deal.disputeWindow.open) actions.push('openDispute');
  if (status === 'disputed' && deal.dispute?.status.key === 'open' && deal.dispute.evidenceOpen) {
    actions.push('addEvidence');
  }

  if (brand && deal.retention.some(window => window.reportAvailable)) actions.push('reportRetention');
  if (!brand && deal.retentionCases.some(c => c.status.key === 'awaiting_influencer')) {
    actions.push('restorePost');
  }

  if (deal.rating?.open && !deal.rating[role].answered) actions.push('rate');

  return actions;
};

export const getDealItemActions = (
  item: Pick<DealItem, 'status' | 'approveAsIsAvailable'>,
  role: DealRole,
): DealItemAction[] => {
  const status = item.status.key;
  const actions: DealItemAction[] = status === null ? [] : [...DEAL_ITEM_ACTIONS[status][role]];
  if (role === 'brand' && item.approveAsIsAvailable) actions.push('approveAsIs');
  return actions;
};

export interface DealProgressStep {
  phase: DealPhase;
  state: TimelineStepState;
}

export interface DealProgressInput {
  status: DealStatus | null;
  /** Slowest item while `in_progress`. */
  stage: DealItemStatus | null;
  /** Shipping phase shows only when the offer includes a product. */
  hasShipping: boolean;
  /** While `disputed`: the status the dispute froze (`dispute.priorStatus`). */
  frozenFrom?: DealStatus | null;
}

const phaseOf = (status: DealStatus, stage: DealItemStatus | null): DealPhase | null =>
  status === 'in_progress' ? getDealItemStatusMeta(stage).phase : DEAL_STATUS_META[status].phase;

/**
 * Journey phases with their state for `Timeline`. A dispute marks the phase it froze as `error`.
 * Drafts, unknown statuses and stopped deals return `[]`: the screen shows the outcome instead.
 */
export const buildDealProgress = ({
  status,
  stage,
  hasShipping,
  frozenFrom = null,
}: DealProgressInput): DealProgressStep[] => {
  if (status === null) return [];
  const phases = DEAL_PHASES.filter(phase => hasShipping || phase !== 'shipping');
  const meta = DEAL_STATUS_META[status];

  if (meta.outcome === 'success') return phases.map(phase => ({ phase, state: 'done' }));

  const disputed = status === 'disputed';
  const reached = disputed ? (frozenFrom === null ? null : phaseOf(frozenFrom, stage)) : phaseOf(status, stage);
  if (meta.outcome === 'stopped' || reached === null) return [];

  const current = phases.indexOf(reached);
  return phases.map((phase, index) => ({
    phase,
    state: index < current ? 'done' : index === current ? (disputed ? 'error' : 'current') : 'upcoming',
  }));
};
