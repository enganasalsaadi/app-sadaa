import type { ParseKeys } from 'i18next';
import type { DealRatingCriterion } from '../types/deal';

/** Server rules for `RateDealRequest`: whole scores 1–5, an optional note. */
export const DEAL_RATING_LIMITS = {
  minScore: 1,
  maxScore: 5,
  maxCommentLength: 1000,
} as const;

/** The rating window after completion (`deals.sla_hours.rating`): drawn only, never a deadline. */
export const DEAL_RATING_WINDOW_HOURS = 168;

/** A picked score shows lifted for this long before the next question rises. */
export const DEAL_RATING_ADVANCE_MS = 350;

/** The five scores, low to high, as the pads read them. */
export const DEAL_RATING_SCORES = [1, 2, 3, 4, 5] as const;
export type DealRatingScore = (typeof DEAL_RATING_SCORES)[number];

export const DEAL_RATING_LEVEL_LABEL = {
  1: 'marketplace.deals.rating.level.1',
  2: 'marketplace.deals.rating.level.2',
  3: 'marketplace.deals.rating.level.3',
  4: 'marketplace.deals.rating.level.4',
  5: 'marketplace.deals.rating.level.5',
} as const satisfies Record<DealRatingScore, ParseKeys>;

interface CriterionCopy {
  /** The question card's title. */
  title: ParseKeys;
  /** One line under it: what to judge. */
  hint: ParseKeys;
}

export const DEAL_RATING_CRITERION_COPY = {
  content_quality: {
    title: 'marketplace.deals.rating.criterion.content_quality.title',
    hint: 'marketplace.deals.rating.criterion.content_quality.hint',
  },
  timeliness: {
    title: 'marketplace.deals.rating.criterion.timeliness.title',
    hint: 'marketplace.deals.rating.criterion.timeliness.hint',
  },
  communication: {
    title: 'marketplace.deals.rating.criterion.communication.title',
    hint: 'marketplace.deals.rating.criterion.communication.hint',
  },
  brief_clarity: {
    title: 'marketplace.deals.rating.criterion.brief_clarity.title',
    hint: 'marketplace.deals.rating.criterion.brief_clarity.hint',
  },
  review_speed: {
    title: 'marketplace.deals.rating.criterion.review_speed.title',
    hint: 'marketplace.deals.rating.criterion.review_speed.hint',
  },
  request_clarity: {
    title: 'marketplace.deals.rating.criterion.request_clarity.title',
    hint: 'marketplace.deals.rating.criterion.request_clarity.hint',
  },
} as const satisfies Record<DealRatingCriterion, CriterionCopy>;
