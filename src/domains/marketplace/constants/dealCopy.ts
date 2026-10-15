import type { ParseKeys } from 'i18next';
import type { DealRetentionTerm, DealStatus } from '../types';
import type { DealJourneyStageKey } from '../utils/dealJourney';
import type { DealNextActor, DealNextStepKey } from '../utils/dealNextStep';
import type { DealNoteReason } from '../utils/dealTimelineEvents';

/** One-word station names for the ticket stepper and the orbit, the same from both sides. */
export const DEAL_STATION_LABEL = {
  sign: 'marketplace.deals.station.sign',
  reply: 'marketplace.deals.station.reply',
  escrow: 'marketplace.deals.station.escrow',
  ship: 'marketplace.deals.station.ship',
  make: 'marketplace.deals.station.make',
  review: 'marketplace.deals.station.review',
  publish: 'marketplace.deals.station.publish',
  done: 'marketplace.deals.station.done',
} as const satisfies Record<DealJourneyStageKey, ParseKeys>;

/** How long a live post must stay up («يبقى 30 يوماً»). */
export const DEAL_RETENTION_LABEL = {
  '24h': 'marketplace.offer.retention.24h',
  '30d': 'marketplace.offer.retention.30d',
  '90d': 'marketplace.offer.retention.90d',
  '180d': 'marketplace.offer.retention.180d',
  permanent: 'marketplace.offer.retention.permanent',
} as const satisfies Record<DealRetentionTerm, ParseKeys>;

export interface DealNextStepCopy {
  /** Short line under a ticket; `{{name}}` = the other side. */
  title: ParseKeys;
  /** What happens around it, on the detail's card. */
  body: ParseKeys;
}

export const DEAL_NEXT_STEP_COPY = {
  brandDraft: {
    title: 'marketplace.deals.next.brandDraft.title',
    body: 'marketplace.deals.next.brandDraft.body',
  },
  brandWaitReply: {
    title: 'marketplace.deals.next.brandWaitReply.title',
    body: 'marketplace.deals.next.brandWaitReply.body',
  },
  brandAnswerExtension: {
    title: 'marketplace.deals.next.brandAnswerExtension.title',
    body: 'marketplace.deals.next.brandAnswerExtension.body',
  },
  brandFund: {
    title: 'marketplace.deals.next.brandFund.title',
    body: 'marketplace.deals.next.brandFund.body',
  },
  brandEscrowLocked: {
    title: 'marketplace.deals.next.brandEscrowLocked.title',
    body: 'marketplace.deals.next.brandEscrowLocked.body',
  },
  brandShip: {
    title: 'marketplace.deals.next.brandShip.title',
    body: 'marketplace.deals.next.brandShip.body',
  },
  brandWaitReceipt: {
    title: 'marketplace.deals.next.brandWaitReceipt.title',
    body: 'marketplace.deals.next.brandWaitReceipt.body',
  },
  brandAnswerIssue: {
    title: 'marketplace.deals.next.brandAnswerIssue.title',
    body: 'marketplace.deals.next.brandAnswerIssue.body',
  },
  brandWaitDraft: {
    title: 'marketplace.deals.next.brandWaitDraft.title',
    body: 'marketplace.deals.next.brandWaitDraft.body',
  },
  brandReviewDraft: {
    title: 'marketplace.deals.next.brandReviewDraft.title',
    body: 'marketplace.deals.next.brandReviewDraft.body',
  },
  brandWaitPublish: {
    title: 'marketplace.deals.next.brandWaitPublish.title',
    body: 'marketplace.deals.next.brandWaitPublish.body',
  },
  brandVerifyPost: {
    title: 'marketplace.deals.next.brandVerifyPost.title',
    body: 'marketplace.deals.next.brandVerifyPost.body',
  },
  creatorReply: {
    title: 'marketplace.deals.next.creatorReply.title',
    body: 'marketplace.deals.next.creatorReply.body',
  },
  creatorWaitExtension: {
    title: 'marketplace.deals.next.creatorWaitExtension.title',
    body: 'marketplace.deals.next.creatorWaitExtension.body',
  },
  creatorWaitFund: {
    title: 'marketplace.deals.next.creatorWaitFund.title',
    body: 'marketplace.deals.next.creatorWaitFund.body',
  },
  creatorEscrowLocked: {
    title: 'marketplace.deals.next.creatorEscrowLocked.title',
    body: 'marketplace.deals.next.creatorEscrowLocked.body',
  },
  creatorWaitShip: {
    title: 'marketplace.deals.next.creatorWaitShip.title',
    body: 'marketplace.deals.next.creatorWaitShip.body',
  },
  creatorReceive: {
    title: 'marketplace.deals.next.creatorReceive.title',
    body: 'marketplace.deals.next.creatorReceive.body',
  },
  creatorWaitIssue: {
    title: 'marketplace.deals.next.creatorWaitIssue.title',
    body: 'marketplace.deals.next.creatorWaitIssue.body',
  },
  creatorSubmitDraft: {
    title: 'marketplace.deals.next.creatorSubmitDraft.title',
    body: 'marketplace.deals.next.creatorSubmitDraft.body',
  },
  creatorWaitReview: {
    title: 'marketplace.deals.next.creatorWaitReview.title',
    body: 'marketplace.deals.next.creatorWaitReview.body',
  },
  creatorPublish: {
    title: 'marketplace.deals.next.creatorPublish.title',
    body: 'marketplace.deals.next.creatorPublish.body',
  },
  creatorWaitVerify: {
    title: 'marketplace.deals.next.creatorWaitVerify.title',
    body: 'marketplace.deals.next.creatorWaitVerify.body',
  },
  dispute: {
    title: 'marketplace.deals.next.dispute.title',
    body: 'marketplace.deals.next.dispute.body',
  },
  rate: {
    title: 'marketplace.deals.next.rate.title',
    body: 'marketplace.deals.next.rate.body',
  },
  done: {
    title: 'marketplace.deals.next.done.title',
    body: 'marketplace.deals.next.done.body',
  },
} as const satisfies Record<DealNextStepKey, DealNextStepCopy>;

export const DEAL_NEXT_ACTOR_LABEL = {
  you: 'marketplace.deals.actor.you',
  other: 'marketplace.deals.actor.other',
  sada: 'marketplace.deals.actor.sada',
} as const satisfies Record<DealNextActor, ParseKeys>;

export const DEAL_NOTE_LABEL = {
  shipped: 'marketplace.deals.note.shipped',
  shipment_updated: 'marketplace.deals.note.shipment_updated',
  upsell_proposed: 'marketplace.deals.note.upsell_proposed',
  upsell_accepted: 'marketplace.deals.note.upsell_accepted',
  upsell_voided: 'marketplace.deals.note.upsell_voided',
  upsell_unfunded: 'marketplace.deals.note.upsell_unfunded',
  retention_reported: 'marketplace.deals.note.retention_reported',
  retention_restored: 'marketplace.deals.note.retention_restored',
  retention_contested: 'marketplace.deals.note.retention_contested',
  retention_confirmed: 'marketplace.deals.note.retention_confirmed',
  retention_rejected: 'marketplace.deals.note.retention_rejected',
  retention_escalated: 'marketplace.deals.note.retention_escalated',
  retention_auto_confirmed: 'marketplace.deals.note.retention_auto_confirmed',
  retention_clawback: 'marketplace.deals.note.retention_clawback',
  rating_window_opened: 'marketplace.deals.note.rating_window_opened',
  rating_submitted: 'marketplace.deals.note.rating_submitted',
  ratings_revealed: 'marketplace.deals.note.ratings_revealed',
  dispute_evidence_added: 'marketplace.deals.note.dispute_evidence_added',
  dispute_evidence_reopened: 'marketplace.deals.note.dispute_evidence_reopened',
} as const satisfies Record<DealNoteReason, ParseKeys>;

type StoppedStatus = Exclude<
  DealStatus,
  | 'draft'
  | 'pending_influencer'
  | 'negotiating_deadline'
  | 'awaiting_payment'
  | 'escrow_locked'
  | 'product_shipping'
  | 'shipping_issue'
  | 'in_progress'
  | 'disputed'
  | 'completed'
  | 'resolved_payout'
>;

/** What an early end means for the money, in plain words; the status label comes from the server. */
export const DEAL_OUTCOME_COPY = {
  declined: 'marketplace.deals.outcome.declined',
  expired: 'marketplace.deals.outcome.expired',
  cancelled_pre_escrow: 'marketplace.deals.outcome.cancelled_pre_escrow',
  cancelled_payment_timeout:
    'marketplace.deals.outcome.cancelled_payment_timeout',
  cancelled_by_brand: 'marketplace.deals.outcome.cancelled_by_brand',
  cancelled_with_kill_fee: 'marketplace.deals.outcome.cancelled_with_kill_fee',
  cancelled_by_influencer: 'marketplace.deals.outcome.cancelled_by_influencer',
  cancelled_shipping_timeout:
    'marketplace.deals.outcome.cancelled_shipping_timeout',
  creator_defaulted: 'marketplace.deals.outcome.creator_defaulted',
  resolved_refund: 'marketplace.deals.outcome.resolved_refund',
  resolved_split: 'marketplace.deals.outcome.resolved_split',
} as const satisfies Record<StoppedStatus, ParseKeys>;

export const isStoppedStatus = (
  status: DealStatus | null,
): status is StoppedStatus => status !== null && status in DEAL_OUTCOME_COPY;
