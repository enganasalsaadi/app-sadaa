import type { ParseKeys } from 'i18next';
import type { CreatorDealAction } from '../types';

/**
 * The «your turn» card's button, one short verb per action. The action itself is the server's
 * label (shown big above it); the button only says what tapping does.
 */
export const CREATOR_DEAL_ACTION_CTA = {
  reply_offer: 'marketplace.creatorHome.deals.cta.replyOffer',
  confirm_receipt: 'marketplace.creatorHome.deals.cta.confirmReceipt',
  submit_draft: 'marketplace.creatorHome.deals.cta.submitDraft',
  revise_draft: 'marketplace.creatorHome.deals.cta.reviseDraft',
  publish: 'marketplace.creatorHome.deals.cta.publish',
  fix_live_url: 'marketplace.creatorHome.deals.cta.fixLiveUrl',
  answer_upsell: 'marketplace.creatorHome.deals.cta.answerUpsell',
  add_evidence: 'marketplace.creatorHome.deals.cta.addEvidence',
  restore_post: 'marketplace.creatorHome.deals.cta.restorePost',
  rate: 'marketplace.creatorHome.deals.cta.rate',
} as const satisfies Record<CreatorDealAction, ParseKeys>;

/** An action without a known key (server ahead of the app) still opens its deal. */
export const UNKNOWN_CREATOR_DEAL_ACTION_CTA: ParseKeys = 'marketplace.creatorHome.deals.cta.open';

/**
 * The clock bar is a gauge of «how soon», not of the window: Home has no window length, so the
 * bar is full at this much time left and drains toward the deadline. The exact time left is
 * always printed beside it.
 */
export const CREATOR_DEAL_CLOCK_HORIZON_SECONDS = 72 * 3600;
