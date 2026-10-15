import { DEAL_STATUS_META } from '../constants/dealStatus';
import { isDealItemStatus, isDealStatus } from '../types';
import type { Deal, DealItemStatus, DealStatus } from '../types';
import {
  buildDealJourney,
  type DealJourneyStage,
  type DealJourneyStageKey,
} from './dealJourney';

/**
 * How a live deal reads on its journey: `open` moving · `disputed` frozen in red at the station
 * the dispute stopped · `stopped` a final that ended early (grey, ✕ at that station) · `done`.
 */
export type DealStationState = 'open' | 'disputed' | 'stopped' | 'done';

export interface DealStationView {
  current: DealJourneyStageKey;
  state: DealStationState;
  stages: DealJourneyStage[];
}

/** Where each item status sits while the deal is `in_progress` (the deal stage is the slowest item). */
const ITEM_STATION = {
  pending: 'make',
  revision_requested: 'make',
  draft_submitted: 'review',
  approved_to_publish: 'publish',
  verifying_live: 'publish',
  verified: 'publish',
} as const satisfies Record<DealItemStatus, DealJourneyStageKey>;

/**
 * The station a status belongs to. Finals that ended early point at where they stopped; for the
 * cancels that can happen at more than one station, `ship` is refined from the shipments below.
 */
const STATUS_STATION = {
  draft: 'sign',
  pending_influencer: 'reply',
  negotiating_deadline: 'reply',
  awaiting_payment: 'escrow',
  escrow_locked: 'escrow',
  product_shipping: 'ship',
  shipping_issue: 'ship',
  in_progress: 'make',
  disputed: 'make',
  completed: 'done',
  declined: 'reply',
  expired: 'reply',
  cancelled_pre_escrow: 'reply',
  cancelled_payment_timeout: 'escrow',
  cancelled_by_brand: 'make',
  cancelled_with_kill_fee: 'make',
  cancelled_by_influencer: 'make',
  cancelled_shipping_timeout: 'ship',
  creator_defaulted: 'make',
  resolved_refund: 'review',
  resolved_payout: 'done',
  resolved_split: 'review',
} as const satisfies Record<DealStatus, DealJourneyStageKey>;

/** Cancels that can land before the product arrived as well as during creation. */
const SHIPPING_SENSITIVE: ReadonlySet<DealStatus> = new Set([
  'cancelled_by_brand',
  'cancelled_with_kill_fee',
  'cancelled_by_influencer',
  'creator_defaulted',
]);

/** Station of a timeline row's target status (deal or item). Unknown keys → `null`. */
export const stationOfStatus = (
  key: string,
  subject: 'deal' | 'item',
): DealJourneyStageKey | null => {
  if (subject === 'item')
    return isDealItemStatus(key) ? ITEM_STATION[key] : null;
  return isDealStatus(key) ? STATUS_STATION[key] : null;
};

type StationInput = Pick<
  Deal,
  'status' | 'stage' | 'shippingMode' | 'shipping' | 'dispute'
>;

const hasProductOf = (deal: StationInput) =>
  deal.shippingMode.key !== null && deal.shippingMode.key !== 'none';

const productArrived = (deal: StationInput) =>
  deal.shipping?.shipments.some(shipment => shipment.receivedAt !== null) ??
  false;

const liveStation = (
  status: DealStatus,
  stage: DealItemStatus | null,
): DealJourneyStageKey =>
  status === 'in_progress'
    ? ITEM_STATION[stage ?? 'pending']
    : STATUS_STATION[status];

/**
 * The deal's place on the journey for the list stepper and the detail orbit. Unknown statuses
 * (newer server) read as `open` at `sign`, so nothing crashes and nothing claims progress.
 */
export const dealStation = (deal: StationInput): DealStationView => {
  const hasProduct = hasProductOf(deal);
  const status = deal.status.key;
  const stage = deal.stage?.key ?? null;
  const build = (
    current: DealJourneyStageKey,
    state: DealStationState,
  ): DealStationView => ({
    current,
    state,
    stages: buildDealJourney({ hasProduct, current }),
  });

  if (status === null) return build('sign', 'open');

  if (status === 'disputed') {
    const prior = deal.dispute?.priorStatus ?? null;
    return build(
      prior === null || prior === 'disputed'
        ? 'make'
        : liveStation(prior, stage),
      'disputed',
    );
  }

  const { outcome } = DEAL_STATUS_META[status];
  if (outcome === 'success') return build('done', 'done');
  if (outcome === 'stopped') {
    const prior = deal.dispute?.priorStatus ?? null;
    if (
      (status === 'resolved_refund' || status === 'resolved_split') &&
      prior !== null &&
      prior !== 'disputed'
    ) {
      return build(liveStation(prior, stage), 'stopped');
    }
    const early =
      SHIPPING_SENSITIVE.has(status) && hasProduct && !productArrived(deal);
    return build(early ? 'ship' : STATUS_STATION[status], 'stopped');
  }
  return build(liveStation(status, stage), 'open');
};
