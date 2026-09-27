import type { ParseKeys } from 'i18next';
import type { HueTone } from '@/core/theme';
import type { DealAction, DealRole, DealStatus, DraftStatus } from '../types';

export interface StatusMeta {
  labelKey: ParseKeys;
  tone: HueTone;
}

/** Tones per rule 08: info = waiting on review, warning = waiting on money, teal = moving, neutral = closed. */
export const DEAL_STATUS_META = {
  pending_approval: { labelKey: 'marketplace.deal.status.pendingApproval', tone: 'info' },
  awaiting_payment: { labelKey: 'marketplace.deal.status.awaitingPayment', tone: 'warning' },
  in_progress: { labelKey: 'marketplace.deal.status.inProgress', tone: 'interactive' },
  under_review: { labelKey: 'marketplace.deal.status.underReview', tone: 'info' },
  ready_to_publish: { labelKey: 'marketplace.deal.status.readyToPublish', tone: 'interactive' },
  published: { labelKey: 'marketplace.deal.status.published', tone: 'interactive' },
  completed: { labelKey: 'marketplace.deal.status.completed', tone: 'success' },
  disputed: { labelKey: 'marketplace.deal.status.disputed', tone: 'danger' },
  cancelled: { labelKey: 'marketplace.deal.status.cancelled', tone: 'neutral' },
  refunded: { labelKey: 'marketplace.deal.status.refunded', tone: 'neutral' },
} as const satisfies Record<DealStatus, StatusMeta>;

/** Shown for a status this build doesn't know yet (server ahead of the app). */
export const UNKNOWN_DEAL_STATUS_META: StatusMeta = {
  labelKey: 'marketplace.deal.status.unknown',
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
