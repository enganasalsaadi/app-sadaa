import type { StrengthStage, StrengthStageKey } from '@/domains/identity';
import type { CreatorActiveDeal } from '../../../types';
import type { HomeNoticeKey } from './resolveHomeNotice';

/** One card of Home's task deck. */
export type HomeTask =
  | { kind: 'notice'; key: HomeNoticeKey }
  | { kind: 'deal'; deal: CreatorActiveDeal }
  | { kind: 'step'; stage: StrengthStageKey };

export interface HomeTasksInput {
  notice: HomeNoticeKey | null;
  /** Deals waiting on the creator, in the server's order. */
  waiting: readonly CreatorActiveDeal[];
  /** Before the first offer ever: the storefront steps still open join the deck. */
  welcome: boolean;
  stages: readonly StrengthStage[];
}

/** A notice that already asks for this stage; the deck shows it once. */
const STAGE_OF_NOTICE: Partial<Record<HomeNoticeKey, StrengthStageKey>> = {
  rateCardRequired: 'rates',
  kycRejected: 'kyc',
};

/**
 * The deck, most pressing first: the one blocker (it stops offers), then the deals waiting on the
 * creator, then (before the first offer only) each storefront stage not done yet, in track order.
 */
export const buildHomeTasks = ({ notice, waiting, welcome, stages }: HomeTasksInput): HomeTask[] => {
  const tasks: HomeTask[] = [];
  if (notice) tasks.push({ kind: 'notice', key: notice });
  waiting.forEach(deal => tasks.push({ kind: 'deal', deal }));
  if (welcome) {
    const covered = notice ? STAGE_OF_NOTICE[notice] : undefined;
    stages
      .filter(stage => stage.state !== 'done' && stage.key !== covered)
      .forEach(stage => tasks.push({ kind: 'step', stage: stage.key }));
  }
  return tasks;
};

/** Stable per card, so the deck keeps its place when a refresh reorders nothing. */
export const homeTaskKey = (task: HomeTask): string => {
  switch (task.kind) {
    case 'notice':
      return `notice:${task.key}`;
    case 'deal':
      return `deal:${task.deal.id}`;
    case 'step':
      return `step:${task.stage}`;
    default: {
      const _exhaustive: never = task;
      return _exhaustive;
    }
  }
};
