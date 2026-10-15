import type { ParseKeys } from 'i18next';

/** Server `deals.content` caps (handoff M6); the forms validate against the same numbers. */
export const DEAL_DRAFT_LIMITS = {
  files: 10,
  caption: 2200,
  revisionNote: 2000,
  pins: 20,
  pinNote: 500,
  /** Longest video moment a pin may point at (10 h). */
  pinSecond: 36000,
} as const;

/** How a draft file is named in the review («Video» / «Photo»). */
export const DEAL_DRAFT_KIND_LABEL = {
  video: 'marketplace.deals.drafts.review.kind.video',
  image: 'marketplace.deals.drafts.review.kind.image',
} as const satisfies Record<'video' | 'image', ParseKeys>;
