import { CREATOR_DEAL_CLOCK_HORIZON_SECONDS } from '../constants/creatorHomeDeals';
import type { CreatorActiveDeal } from '../types';
import { DEAL_LATE_SECONDS, timerSecondsLeft } from './dealTimer';

/** A card's clock at `now`; `paused` = the server froze the deadline (`due_at` is `null`, rule 06). */
export type CreatorDealClock =
  | { kind: 'left'; seconds: number; share: number; late: boolean }
  | { kind: 'paused' };

export const creatorDealClock = (dueAt: number | null, now: number): CreatorDealClock => {
  if (dueAt === null) return { kind: 'paused' };
  const seconds = timerSecondsLeft(dueAt, now);
  return {
    kind: 'left',
    seconds,
    share: Math.min(1, seconds / CREATOR_DEAL_CLOCK_HORIZON_SECONDS),
    late: seconds < DEAL_LATE_SECONDS,
  };
};

/**
 * The server's list, split for Home: the cards waiting on the creator (in the server's order) and
 * the nearest deadline among the rest, for the quiet card's «next up» line.
 */
export const splitCreatorDeals = (
  items: CreatorActiveDeal[],
): { waiting: CreatorActiveDeal[]; nextUp: CreatorActiveDeal | null } => {
  const waiting = items.filter(deal => deal.needsAction);
  const rest = items.filter(deal => !deal.needsAction && deal.dueAt !== null);
  const nextUp = rest.reduce<CreatorActiveDeal | null>(
    (best, deal) => (best === null || (deal.dueAt ?? 0) < (best.dueAt ?? 0) ? deal : best),
    null,
  );
  return { waiting, nextUp };
};
