import { DEAL_RATING_WINDOW_HOURS } from '../constants/dealRating';
import {
  DEAL_RATING_CRITERIA,
  type DealRating,
  type DealRatingCriterion,
  type DealRatingRequest,
  type DealRatingSide,
  type DealRole,
  type Timestamp,
} from '../types/deal';

const MS_PER_HOUR = 3_600_000;

/**
 * Where the viewer's rating stands: still to give (`invite`), given and waiting for the other
 * side (`sealed`), the window shut but the reveal not in yet (`closing`), or both opened.
 */
export type DealRatingStage = 'invite' | 'sealed' | 'closing' | 'revealed';

export type DealRatingScores = Partial<Record<DealRatingCriterion, number>>;

export interface DealRatingView {
  stage: DealRatingStage;
  /** What the viewer rates the other side on. */
  criteria: readonly DealRatingCriterion[];
  /** What the other side rated the viewer on. */
  theirCriteria: readonly DealRatingCriterion[];
  /** `null` while on account hold: nothing counts down. */
  dueAt: Timestamp | null;
  /** Account hold: the window is paused (rating is still allowed). */
  onHold: boolean;
  revealedAt: Timestamp | null;
  mine: DealRatingSide;
  theirs: DealRatingSide;
}

const otherRole = (role: DealRole): DealRole =>
  role === 'brand' ? 'creator' : 'brand';

/** The three criteria a role scores the other side on. */
export const ratingCriteriaOf = (
  role: DealRole,
): readonly DealRatingCriterion[] => DEAL_RATING_CRITERIA[role];

/** The deal's rating from the viewer's side; `null` before completion (no window). */
export const dealRatingView = (
  rating: DealRating | null,
  role: DealRole,
): DealRatingView | null => {
  if (!rating) return null;
  const mine = rating[role];
  const theirs = rating[otherRole(role)];
  const revealed =
    rating.revealedAt !== null ||
    mine.revealed !== null ||
    theirs.revealed !== null;
  const stage: DealRatingStage = revealed
    ? 'revealed'
    : !rating.open
      ? 'closing'
      : mine.answered
        ? 'sealed'
        : 'invite';
  return {
    stage,
    criteria: ratingCriteriaOf(role),
    theirCriteria: ratingCriteriaOf(otherRole(role)),
    dueAt: rating.onHold ? null : rating.dueAt,
    onHold: rating.onHold,
    revealedAt: rating.revealedAt,
    mine,
    theirs,
  };
};

/** Mean of the scores given, one decimal; `null` when none. A preview: the server's `overall` wins. */
export const ratingAverage = (
  scores: DealRatingScores,
  criteria: readonly DealRatingCriterion[],
): number | null => {
  const given = criteria.flatMap(criterion => {
    const score = scores[criterion];
    return score === undefined ? [] : [score];
  });
  if (given.length === 0) return null;
  const mean = given.reduce((sum, score) => sum + score, 0) / given.length;
  return Math.round(mean * 10) / 10;
};

/** The first question still unanswered, or `-1` once every criterion has a score. */
export const firstMissingCriterion = (
  scores: DealRatingScores,
  criteria: readonly DealRatingCriterion[],
): number => criteria.findIndex(criterion => scores[criterion] === undefined);

/** `POST …/rating` body: exactly the role's criteria, and the note only when there is one. */
export const toRatingBody = (
  scores: DealRatingScores,
  criteria: readonly DealRatingCriterion[],
  comment: string,
): DealRatingRequest => {
  const trimmed = comment.trim();
  const picked: DealRatingScores = {};
  for (const criterion of criteria) {
    const score = scores[criterion];
    if (score !== undefined) picked[criterion] = score;
  }
  return { scores: picked, ...(trimmed ? { comment: trimmed } : {}) };
};

/** Hours left before the reveal (rounded up, never negative); `null` when the server sends no deadline. */
export const ratingHoursLeft = (
  dueAt: Timestamp | null,
  now: number,
): number | null =>
  dueAt === null ? null : Math.max(0, Math.ceil((dueAt - now) / MS_PER_HOUR));

/** Share of the seven-day window still left, 0–1, for the clock ring. Display only. */
export const ratingWindowLeft = (
  dueAt: Timestamp | null,
  now: number,
): number => {
  if (dueAt === null) return 0;
  const left = (dueAt - now) / (DEAL_RATING_WINDOW_HOURS * MS_PER_HOUR);
  return Math.min(1, Math.max(0, left));
};
