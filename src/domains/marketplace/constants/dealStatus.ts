import type { ParseKeys } from 'i18next';
import type { HueTone } from '@/core/theme';
import type { DealAction, DealRole, DealStatus, DraftStatus } from '../types';

export interface StatusMeta {
  labelKey: ParseKeys;
  tone: HueTone;
}

export interface DealStatusMeta extends StatusMeta {
  /** One-word stage name for the horizontal stage track (`DealProgress variant="track"`). */
  stageKey: ParseKeys;
}

/** Tones per rule 08: info = waiting on review, warning = waiting on money, teal = moving, neutral = closed. */
export const DEAL_STATUS_META = {
  pending_approval: {
    labelKey: 'marketplace.deal.status.pendingApproval',
    stageKey: 'marketplace.deal.stage.pendingApproval',
    tone: 'info',
  },
  awaiting_payment: {
    labelKey: 'marketplace.deal.status.awaitingPayment',
    stageKey: 'marketplace.deal.stage.awaitingPayment',
    tone: 'warning',
  },
  in_progress: {
    labelKey: 'marketplace.deal.status.inProgress',
    stageKey: 'marketplace.deal.stage.inProgress',
    tone: 'interactive',
  },
  under_review: {
    labelKey: 'marketplace.deal.status.underReview',
    stageKey: 'marketplace.deal.stage.underReview',
    tone: 'info',
  },
  ready_to_publish: {
    labelKey: 'marketplace.deal.status.readyToPublish',
    stageKey: 'marketplace.deal.stage.readyToPublish',
    tone: 'interactive',
  },
  published: {
    labelKey: 'marketplace.deal.status.published',
    stageKey: 'marketplace.deal.stage.published',
    tone: 'interactive',
  },
  completed: {
    labelKey: 'marketplace.deal.status.completed',
    stageKey: 'marketplace.deal.stage.completed',
    tone: 'success',
  },
  disputed: {
    labelKey: 'marketplace.deal.status.disputed',
    stageKey: 'marketplace.deal.stage.disputed',
    tone: 'danger',
  },
  cancelled: {
    labelKey: 'marketplace.deal.status.cancelled',
    stageKey: 'marketplace.deal.stage.cancelled',
    tone: 'neutral',
  },
  refunded: {
    labelKey: 'marketplace.deal.status.refunded',
    stageKey: 'marketplace.deal.stage.refunded',
    tone: 'neutral',
  },
} as const satisfies Record<DealStatus, DealStatusMeta>;

/** Shown for a status this build doesn't know yet (server ahead of the app). */
export const UNKNOWN_DEAL_STATUS_META: DealStatusMeta = {
  labelKey: 'marketplace.deal.status.unknown',
  stageKey: 'marketplace.deal.stage.unknown',
  tone: 'neutral',
};

/** The happy path, in order. Off-path statuses (dispute, cancel, refund) branch from any stage. */
export const DEAL_PIPELINE = [
  'pending_approval',
  'awaiting_payment',
  'in_progress',
  'under_review',
  'ready_to_publish',
  'published',
  'completed',
] as const satisfies readonly DealStatus[];

const NONE: readonly DealAction[] = [];

/** UX hint only: which action buttons to show. The server decides whether the action is allowed (rule 06). */
export const DEAL_ALLOWED_ACTIONS = {
  pending_approval: { creator: ['accept', 'decline'], brand: ['cancel'] },
  awaiting_payment: { creator: NONE, brand: ['pay', 'cancel'] },
  in_progress: { creator: ['submitDraft', 'openDispute'], brand: ['openDispute'] },
  under_review: { creator: NONE, brand: ['approveDraft', 'requestChanges', 'openDispute'] },
  ready_to_publish: { creator: ['submitProof', 'openDispute'], brand: ['openDispute'] },
  published: { creator: ['openDispute'], brand: ['openDispute'] },
  completed: { creator: NONE, brand: NONE },
  disputed: { creator: NONE, brand: NONE },
  cancelled: { creator: NONE, brand: NONE },
  refunded: { creator: NONE, brand: NONE },
} as const satisfies Record<DealStatus, Record<DealRole, readonly DealAction[]>>;

export const DRAFT_STATUS_META = {
  pending_review: { labelKey: 'marketplace.draft.status.pendingReview', tone: 'info' },
  approved: { labelKey: 'marketplace.draft.status.approved', tone: 'success' },
  changes_requested: { labelKey: 'marketplace.draft.status.changesRequested', tone: 'warning' },
} as const satisfies Record<DraftStatus, StatusMeta>;
