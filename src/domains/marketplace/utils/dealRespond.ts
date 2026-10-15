import { DEAL_MAX_EXTENSION_DAYS } from '../constants/dealOffer';
import type { Deal, DealFunding, DealRetentionTerm, DealRole } from '../types';

const HOURS_PER_DAY = 24;

/**
 * Which decision bar the deal page shows (P4): the creator answering a new offer, the brand
 * waiting on that answer (withdraw only), answering the creator's extension, or funding.
 */
export type DealDockKind = 'creatorOffer' | 'brandOffer' | 'brandExtension' | 'brandFunding';

export const dealDockKind = (deal: Pick<Deal, 'status'>, role: DealRole): DealDockKind | null => {
  switch (deal.status.key) {
    case 'pending_influencer':
      return role === 'creator' ? 'creatorOffer' : 'brandOffer';
    case 'negotiating_deadline':
      return role === 'brand' ? 'brandExtension' : null;
    case 'awaiting_payment':
      return role === 'brand' ? 'brandFunding' : null;
    default:
      return null;
  }
};

/** The one extension a creator may ask for: today's days + 1 up to + 14 (`delivery_days` is the new total). */
export interface DealExtensionRange {
  current: number;
  min: number;
  max: number;
}

/** `null` = not possible: already used, or the deal has no delivery window yet. */
export const dealExtensionRange = (
  deal: Pick<Deal, 'deliveryHours' | 'extension'>,
): DealExtensionRange | null => {
  if (deal.extension !== null || deal.deliveryHours === null || deal.deliveryHours <= 0) return null;
  const current = Math.floor(deal.deliveryHours / HOURS_PER_DAY);
  return { current, min: current + 1, max: current + DEAL_MAX_EXTENSION_DAYS };
};

/** The creator's pending ask as the brand reads it: from → to, in hours, with the reason. */
export interface DealExtensionAsk {
  fromHours: number;
  toHours: number;
  reason: string | null;
}

export const dealExtensionAsk = (deal: Pick<Deal, 'extension'>): DealExtensionAsk | null => {
  const ext = deal.extension;
  if (!ext || ext.fromHours === null || ext.toHours === null || ext.toHours <= ext.fromHours) return null;
  return { fromHours: ext.fromHours, toHours: ext.toHours, reason: ext.reason };
};

/**
 * What the brand can do about an unfunded deal. `frozen`: the wallet can't hold money, so no top-up
 * helps (support). `short`: top up the missing amount (the server funds the deal on its own once the
 * top-up lands). `ready`: enough money, retry funding.
 */
export type DealFundingState = 'frozen' | 'short' | 'ready';

export const dealFundingState = (funding: DealFunding | null): DealFundingState => {
  if (funding?.reason === 'wallet_frozen') return 'frozen';
  if (funding && funding.missing.amount > 0) return 'short';
  return 'ready';
};

/** What the creator signs, read off the deal: grouped deliverables and the terms every item shares. */
export interface DealCommitments {
  lines: { title: string; count: number }[];
  deliveryHours: number | null;
  /** Shared by every item, else `null` (each item's own terms are in the dossier). */
  revisions: number | null;
  retention: DealRetentionTerm | null;
  hasProduct: boolean;
}

const shared = <T>(values: T[]): T | null =>
  values.length > 0 && values.every(value => value === values[0]) ? (values[0] ?? null) : null;

export const dealCommitments = (
  deal: Pick<Deal, 'items' | 'deliveryHours' | 'shippingMode'>,
): DealCommitments => {
  const counts = new Map<string, number>();
  for (const item of deal.items) counts.set(item.title, (counts.get(item.title) ?? 0) + 1);
  return {
    lines: [...counts].map(([title, count]) => ({ title, count })),
    deliveryHours: deal.deliveryHours,
    revisions: shared(deal.items.map(item => item.revisionsAllowed)),
    retention: shared(deal.items.map(item => item.retention)),
    hasProduct: deal.shippingMode.key !== null && deal.shippingMode.key !== 'none',
  };
};
