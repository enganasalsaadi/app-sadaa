import {
  CAMPAIGN_DROP_BAR_ORDER,
  CAMPAIGN_DROP_FILTER_ORDER,
  CAMPAIGN_DROP_LANE_ORDER,
} from '../constants/campaignDrop';
import type {
  CampaignDropBoard,
  CampaignDropCreator,
  CampaignDropPhase,
  CampaignDropReminder,
  CampaignDropState,
  CampaignDropTotals,
} from '../types/campaignDrop';
import type { Timestamp } from '../types/deal';

/** The moment the hero counts down to. */
export type CampaignDropMoment = 'publish_open' | 'drop';

export interface CampaignDropView {
  phase: CampaignDropPhase;
  /** `null` once live. */
  next: { moment: CampaignDropMoment; at: Timestamp } | null;
  /** While the live link is the next moment: the drop itself, as the secondary line. */
  then: Timestamp | null;
}

/**
 * Where the drop stands at `now`. The server's phase is where it stood at fetch time, so the screen
 * only moves forward from it: the clock may open the next moment before a refetch says so.
 */
export const campaignDropView = (board: CampaignDropBoard, now: number): CampaignDropView => {
  const phase: CampaignDropPhase =
    board.phase === 'live' || now >= board.dropAt
      ? 'live'
      : board.phase === 'publish_open' || now >= board.publishOpensAt
        ? 'publish_open'
        : 'upcoming';
  switch (phase) {
    case 'upcoming':
      return { phase, next: { moment: 'publish_open', at: board.publishOpensAt }, then: board.dropAt };
    case 'publish_open':
      return { phase, next: { moment: 'drop', at: board.dropAt }, then: null };
    case 'live':
      return { phase, next: null, then: null };
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
};

/** Which of the three stations the track is on (0 = link opening, 1 = the drop, 2 = on air). */
export const CAMPAIGN_DROP_STATION = { upcoming: 0, publish_open: 1, live: 2 } as const satisfies Record<
  CampaignDropPhase,
  number
>;

/** Share of the creators verified (the on-air ring), 0 when nobody is linked. */
export const campaignDropVerifiedShare = ({ linked, verified }: CampaignDropTotals): number =>
  linked > 0 ? Math.min(1, verified / linked) : 0;

/** Longest lead first (24 h, 2 h, at the drop). */
export const sortDropReminders = (reminders: readonly CampaignDropReminder[]): CampaignDropReminder[] =>
  [...reminders].sort((a, b) => b.minutesBefore - a.minutesBefore);

const rankIn = (order: readonly CampaignDropState[], state: CampaignDropState | null): number => {
  if (state === null) return order.length;
  const index = order.indexOf(state);
  return index === -1 ? order.length : index;
};

/** Late creators first, the soonest grace ending leading them; ties keep the server's order. */
export const sortDropLanes = (creators: readonly CampaignDropCreator[]): CampaignDropCreator[] =>
  creators
    .map((creator, index) => ({ creator, index }))
    .sort((a, b) => {
      const byState = rankIn(CAMPAIGN_DROP_LANE_ORDER, a.creator.state.key) - rankIn(CAMPAIGN_DROP_LANE_ORDER, b.creator.state.key);
      if (byState !== 0) return byState;
      if (a.creator.state.key === 'late') {
        const byGrace = (a.creator.lateUntil ?? Infinity) - (b.creator.lateUntil ?? Infinity);
        if (byGrace !== 0) return byGrace;
      }
      return a.index - b.index;
    })
    .map(({ creator }) => creator);

/** One piece per creator, ordered as progress toward live. */
export const sortDropBar = (creators: readonly CampaignDropCreator[]): CampaignDropCreator[] =>
  creators
    .map((creator, index) => ({ creator, index }))
    .sort(
      (a, b) =>
        rankIn(CAMPAIGN_DROP_BAR_ORDER, a.creator.state.key) - rankIn(CAMPAIGN_DROP_BAR_ORDER, b.creator.state.key) ||
        a.index - b.index,
    )
    .map(({ creator }) => creator);

export type CampaignDropFilter = 'all' | CampaignDropState;

export interface CampaignDropChip {
  key: CampaignDropFilter;
  count: number;
}

/** «All» then every state that has creators in it, counted from the server's `totals`. */
export const campaignDropChips = (totals: CampaignDropTotals): CampaignDropChip[] => [
  { key: 'all', count: totals.linked },
  ...CAMPAIGN_DROP_FILTER_ORDER.filter(state => totals[state] > 0).map(state => ({ key: state, count: totals[state] })),
];

export const filterDropLanes = (
  creators: readonly CampaignDropCreator[],
  filter: CampaignDropFilter,
): CampaignDropCreator[] => (filter === 'all' ? [...creators] : creators.filter(creator => creator.state.key === filter));

/** Whole seconds from `from` to `to`, never negative. */
export const secondsBetween = (from: number, to: number): number => Math.max(0, Math.ceil((to - from) / 1000));

export interface CampaignDropClockParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** A countdown split for the big clock; the days cell shows only when there are any. */
export const campaignDropClockParts = (totalSeconds: number): CampaignDropClockParts => {
  const left = Math.max(0, Math.floor(totalSeconds));
  return {
    days: Math.floor(left / 86_400),
    hours: Math.floor((left % 86_400) / 3600),
    minutes: Math.floor((left % 3600) / 60),
    seconds: left % 60,
  };
};
