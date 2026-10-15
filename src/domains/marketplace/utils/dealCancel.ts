import type { Money } from '@/core/money';
import type { DealCancelOutcome, DealCancellation, DealStrike } from '../types/deal';

type BrandTerms = NonNullable<DealCancellation['brand']>;

/** One share of the held money on the settlement bar: back to the brand, to the creator, the platform's fee. */
export interface DealSettlementPart {
  key: 'refund' | 'creator' | 'fee';
  amount: Money;
}

const positive = (money: Money | null): money is Money => money !== null && money.amount > 0;

/**
 * Where the held money goes if the brand cancels now, from the server's figures only
 * (`cancellation.brand`). A free cancel without a stated refund returns the whole deal. When the
 * server gives no creator net, the kill fee shows as one share.
 */
export const dealSettlement = (terms: BrandTerms, total: Money): DealSettlementPart[] => {
  const refund = terms.refund ?? (terms.outcome.key === 'free' ? total : null);
  const creator = terms.creatorNet ?? (terms.platformFee ? null : terms.killFee);
  const parts: DealSettlementPart[] = [];
  if (positive(refund)) parts.push({ key: 'refund', amount: refund });
  if (positive(creator)) parts.push({ key: 'creator', amount: creator });
  if (positive(terms.platformFee)) parts.push({ key: 'fee', amount: terms.platformFee });
  return parts;
};

export interface DealReasonValues<R extends string> {
  reason: R | null;
  note: string;
}

/** `{reason, note?}`: withdraw (creator) and declining an upsell. */
export const toReasonBody = <R extends string>({ reason, note }: DealReasonValues<R>) => {
  const trimmed = note.trim();
  return { reason, ...(trimmed ? { note: trimmed } : {}) };
};

/** Brand cancel: the outcome the brand saw goes back as `expected_outcome`, so moved terms are refused. */
export const toCancelBody = <R extends string>(values: DealReasonValues<R>, outcome: DealCancelOutcome) => ({
  ...toReasonBody(values),
  expected_outcome: outcome,
});

const DAY_MS = 86_400_000;

/** How much of a strike's life is left: whole days (rounded up) and the share of its window. */
export const strikeLife = (strike: Pick<DealStrike, 'occurredAt' | 'expiresAt'>, now: number) => {
  const left = Math.max(0, strike.expiresAt - now);
  const span = strike.expiresAt - strike.occurredAt;
  return {
    daysLeft: Math.ceil(left / DAY_MS),
    share: span > 0 ? Math.min(1, left / span) : 0,
  };
};
