import { DEAL_TRACK_STOP_OF_PHASE, DEAL_TRACK_STOPS } from '../constants/brandHomeDeals';
import { DEAL_ITEM_STATUS_META, DEAL_STATUS_META, type DealPhase } from '../constants/dealStatus';
import type { BrandActiveDeal } from '../types';

/** Where a deal sits on the Home tracker: `stop` indexes `DEAL_TRACK_STOPS`. */
export interface DealTrack {
  stop: number;
  /** Disputed or defaulted: the current stop turns red and reads the server's status. */
  stopped: boolean;
}

const PREPARE = DEAL_TRACK_STOPS.indexOf('prepare');

/**
 * While `in_progress` the slowest item decides between preparing and publishing; otherwise the
 * status does. A stopped deal without a phase (a dispute) sits where its slowest item is, else
 * at «prepare»: money is held by then. An unknown status sits at the start, never crashes.
 */
export const dealTrack = (deal: Pick<BrandActiveDeal, 'status' | 'stage'>): DealTrack => {
  const status = deal.status.key;
  const statusMeta = status ? DEAL_STATUS_META[status] : null;
  const stagePhase: DealPhase | null = deal.stage?.key
    ? DEAL_ITEM_STATUS_META[deal.stage.key].phase
    : null;
  const statusPhase = statusMeta?.phase ?? null;
  const phase = status === 'in_progress' ? stagePhase ?? statusPhase : statusPhase ?? stagePhase;
  const stopped = statusMeta?.tone === 'danger';
  if (!phase) return { stop: stopped ? PREPARE : 0, stopped };
  return { stop: DEAL_TRACK_STOPS.indexOf(DEAL_TRACK_STOP_OF_PHASE[phase]), stopped };
};

/**
 * Home's two layers, in the server's order (needs-action first, soonest due first): the deals
 * waiting on the brand go to the next-step card, the rest to the tracker list.
 */
export const splitActiveDeals = (
  items: readonly BrandActiveDeal[],
): { waiting: BrandActiveDeal[]; moving: BrandActiveDeal[] } => ({
  waiting: items.filter(deal => deal.needsAction),
  moving: items.filter(deal => !deal.needsAction),
});
