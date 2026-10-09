export type TimelineStepState = 'done' | 'current' | 'upcoming' | 'error';

export interface TimelineStep {
  key: string;
  title: string;
  /** Date, actor or note (audit trail line). Pre-formatted by the caller. */
  caption?: string;
  state: TimelineStepState;
}

/** `vertical`: rows with captions (deal detail, audit log) · `track`: one horizontal row of nodes (cards, v4). */
export type TimelineVariant = 'vertical' | 'track';

export interface TimelineProps {
  steps: readonly TimelineStep[];
  variant?: TimelineVariant;
}
