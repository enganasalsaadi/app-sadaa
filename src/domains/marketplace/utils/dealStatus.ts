import type { TimelineStepState } from '@/shared/ui';
import {
  DEAL_ALLOWED_ACTIONS,
  DEAL_PIPELINE,
  DEAL_STATUS_META,
  UNKNOWN_DEAL_STATUS_META,
} from '../constants/dealStatus';
import type { StatusMeta } from '../constants/dealStatus';
import type { DealAction, DealRole, DealStatus } from '../types';

/** `null` = a status the app doesn't know (map raw values with `isDealStatus` at the API edge). */
export const getDealStatusMeta = (status: DealStatus | null): StatusMeta =>
  status === null ? UNKNOWN_DEAL_STATUS_META : DEAL_STATUS_META[status];

export const getDealActions = (
  status: DealStatus | null,
  role: DealRole,
): readonly DealAction[] => (status === null ? [] : DEAL_ALLOWED_ACTIONS[status][role]);

export interface DealProgressStep {
  status: DealStatus;
  state: TimelineStepState;
}

const pipelineIndex = (status: DealStatus): number =>
  (DEAL_PIPELINE as readonly DealStatus[]).indexOf(status);

/**
 * Pipeline stages with their state for `Timeline`. On the happy path every stage
 * shows; off-path (dispute, cancel, refund) shows the stages reached up to
 * `stoppedAt`, then the off-path status as an error step.
 */
export const buildDealProgress = (
  status: DealStatus | null,
  stoppedAt?: DealStatus,
): DealProgressStep[] => {
  if (status === null) return [];

  const current = pipelineIndex(status);
  if (current >= 0) {
    return DEAL_PIPELINE.map((stage, index) => ({
      status: stage,
      state:
        index < current || status === 'completed'
          ? 'done'
          : index === current
            ? 'current'
            : 'upcoming',
    }));
  }

  const reached = stoppedAt === undefined ? -1 : pipelineIndex(stoppedAt);
  return [
    ...DEAL_PIPELINE.slice(0, reached + 1).map(stage => ({ status: stage, state: 'done' as const })),
    { status, state: 'error' },
  ];
};
