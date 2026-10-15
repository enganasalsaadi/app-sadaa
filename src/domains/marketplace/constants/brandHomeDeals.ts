import type { ParseKeys } from 'i18next';
import type { BrandDealAction } from '../types';
import type { DealPhase } from './dealStatus';

/** The four stops a brand follows a deal by on Home (the app's grouping, not a server status). */
export const DEAL_TRACK_STOPS = ['agree', 'prepare', 'publish', 'done'] as const;
export type DealTrackStop = (typeof DEAL_TRACK_STOPS)[number];

/** The journey's six phases folded into the Home tracker's four stops. */
export const DEAL_TRACK_STOP_OF_PHASE = {
  offer: 'agree',
  funding: 'agree',
  shipping: 'prepare',
  creating: 'prepare',
  publishing: 'publish',
  done: 'done',
} as const satisfies Record<DealPhase, DealTrackStop>;

export const DEAL_TRACK_STOP_LABEL = {
  agree: 'marketplace.brandHome.deals.stops.agree',
  prepare: 'marketplace.brandHome.deals.stops.prepare',
  publish: 'marketplace.brandHome.deals.stops.publish',
  done: 'marketplace.brandHome.deals.stops.done',
} as const satisfies Record<DealTrackStop, ParseKeys>;

/**
 * The next-step card's button, one short verb per action. The action itself is the server's
 * label (shown big above it); `fund` carries the deal total.
 */
export const BRAND_DEAL_ACTION_CTA = {
  fund: 'marketplace.brandHome.deals.cta.fund',
  answer_extension: 'marketplace.brandHome.deals.cta.answerExtension',
  answer_issue: 'marketplace.brandHome.deals.cta.answerIssue',
  ship: 'marketplace.brandHome.deals.cta.ship',
  review_draft: 'marketplace.brandHome.deals.cta.reviewDraft',
  verify_post: 'marketplace.brandHome.deals.cta.verifyPost',
  add_evidence: 'marketplace.brandHome.deals.cta.addEvidence',
} as const satisfies Record<BrandDealAction, ParseKeys>;

/** An action without a known key (server ahead of the app) still opens its deal. */
export const UNKNOWN_BRAND_DEAL_ACTION_CTA: ParseKeys = 'marketplace.brandHome.deals.cta.open';

/** Under a day left, the next-step card's clock turns amber (rule 08: warning = time is short). */
export const NEXT_STEP_HOT_SECONDS = 24 * 3600;
