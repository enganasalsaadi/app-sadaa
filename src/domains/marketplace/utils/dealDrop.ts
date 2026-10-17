import { DEAL_STATUS_META } from '../constants/dealStatus';
import type { Deal, DealItemStatus, Timestamp } from '../types';

/** Where a synchronized drop stands: the live link opens a little before the moment itself. */
export type DealDropPhase = 'upcoming' | 'publish_open' | 'live';

export interface DealDropView {
  phase: DealDropPhase;
  dropAt: Timestamp;
  publishOpensAt: Timestamp;
  /** The moment the next clock counts down to: the live link opening, then the drop itself. */
  nextAt: Timestamp | null;
  /** The drop has passed and a deliverable still waits on the creator (grace is the server's). */
  late: boolean;
}

/** Item statuses where the ball is in the creator's court. */
const WITH_CREATOR: ReadonlySet<DealItemStatus> = new Set(['pending', 'revision_requested', 'approved_to_publish']);

type DropInput = Pick<Deal, 'drop' | 'status' | 'items'>;

/**
 * The drop at `now` (contract §5.4), `null` for a direct deal, a campaign without a drop, or a deal
 * that is no longer running. The server's `publishOpen` is trusted, but the clock may open the
 * live link earlier than a stale copy of the deal says, so the button never waits for a refetch.
 */
export const dealDropView = (deal: DropInput, now: number): DealDropView | null => {
  const { drop } = deal;
  const status = deal.status.key;
  if (!drop || status === null || DEAL_STATUS_META[status].outcome !== 'open') return null;
  const live = now >= drop.dropAt;
  const open = drop.publishOpen || now >= drop.publishOpensAt;
  const phase: DealDropPhase = live ? 'live' : open ? 'publish_open' : 'upcoming';
  return {
    phase,
    dropAt: drop.dropAt,
    publishOpensAt: drop.publishOpensAt,
    nextAt: phase === 'upcoming' ? drop.publishOpensAt : phase === 'publish_open' ? drop.dropAt : null,
    late:
      live &&
      status === 'in_progress' &&
      deal.items.some(item => item.status.key !== null && WITH_CREATOR.has(item.status.key)),
  };
};

/** When the live link opens, while it is still closed; `null` once it is open (or without a drop). */
export const dealPublishOpensAt = (deal: DropInput, now: number): Timestamp | null => {
  const view = dealDropView(deal, now);
  return view?.phase === 'upcoming' ? view.publishOpensAt : null;
};
