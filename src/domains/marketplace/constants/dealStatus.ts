import type { ParseKeys } from 'i18next';
import type { HueTone } from '@/core/theme';
import type {
  DealAction,
  DealDraftDecision,
  DealItemAction,
  DealItemStatus,
  DealRole,
  DealStatus,
} from '../types';

/**
 * Where a deal sits on the brand ⇄ creator journey. Status *labels* always come from the
 * server (`status.label`); the app owns only tone, icon, phase and the action hints.
 */
export const DEAL_PHASES = ['offer', 'funding', 'shipping', 'creating', 'publishing', 'done'] as const;
export type DealPhase = (typeof DEAL_PHASES)[number];

/** `open` = still moving · `success` / `stopped` = final. */
export type DealOutcome = 'open' | 'success' | 'stopped';

export interface DealStatusMeta {
  /** Rule 08: info = waiting on a reply, warning = waiting on money / a problem, teal = moving. */
  tone: HueTone;
  outcome: DealOutcome;
  /** The phase this status belongs to; `null` for drafts and off-path finals. */
  phase: DealPhase | null;
}

export const DEAL_STATUS_META = {
  draft: { tone: 'neutral', outcome: 'open', phase: null },
  pending_influencer: { tone: 'info', outcome: 'open', phase: 'offer' },
  negotiating_deadline: { tone: 'info', outcome: 'open', phase: 'offer' },
  awaiting_payment: { tone: 'warning', outcome: 'open', phase: 'funding' },
  escrow_locked: { tone: 'money', outcome: 'open', phase: 'funding' },
  product_shipping: { tone: 'interactive', outcome: 'open', phase: 'shipping' },
  shipping_issue: { tone: 'warning', outcome: 'open', phase: 'shipping' },
  in_progress: { tone: 'interactive', outcome: 'open', phase: 'creating' },
  disputed: { tone: 'danger', outcome: 'open', phase: null },
  completed: { tone: 'success', outcome: 'success', phase: 'done' },
  declined: { tone: 'neutral', outcome: 'stopped', phase: null },
  expired: { tone: 'neutral', outcome: 'stopped', phase: null },
  cancelled_pre_escrow: { tone: 'neutral', outcome: 'stopped', phase: null },
  cancelled_payment_timeout: { tone: 'neutral', outcome: 'stopped', phase: null },
  cancelled_by_brand: { tone: 'neutral', outcome: 'stopped', phase: null },
  cancelled_with_kill_fee: { tone: 'neutral', outcome: 'stopped', phase: null },
  cancelled_by_influencer: { tone: 'neutral', outcome: 'stopped', phase: null },
  cancelled_shipping_timeout: { tone: 'neutral', outcome: 'stopped', phase: null },
  creator_defaulted: { tone: 'danger', outcome: 'stopped', phase: null },
  resolved_refund: { tone: 'neutral', outcome: 'stopped', phase: null },
  resolved_payout: { tone: 'success', outcome: 'success', phase: 'done' },
  resolved_split: { tone: 'neutral', outcome: 'stopped', phase: null },
} as const satisfies Record<DealStatus, DealStatusMeta>;

/** A status this build doesn't know yet (server ahead of the app). */
export const UNKNOWN_DEAL_STATUS_META: DealStatusMeta = { tone: 'neutral', outcome: 'open', phase: null };

export interface DealItemStatusMeta {
  tone: HueTone;
  /** `creating` until the draft is approved, then `publishing`. */
  phase: Extract<DealPhase, 'creating' | 'publishing' | 'done'>;
}

export const DEAL_ITEM_STATUS_META = {
  pending: { tone: 'interactive', phase: 'creating' },
  draft_submitted: { tone: 'info', phase: 'creating' },
  revision_requested: { tone: 'warning', phase: 'creating' },
  approved_to_publish: { tone: 'interactive', phase: 'publishing' },
  verifying_live: { tone: 'info', phase: 'publishing' },
  verified: { tone: 'success', phase: 'done' },
} as const satisfies Record<DealItemStatus, DealItemStatusMeta>;

export const UNKNOWN_DEAL_ITEM_STATUS_META: DealItemStatusMeta = { tone: 'neutral', phase: 'creating' };

/** One-word phase names for the stage track (the app's own grouping, not a server status). */
export const DEAL_PHASE_LABEL = {
  offer: 'marketplace.deal.phase.offer',
  funding: 'marketplace.deal.phase.funding',
  shipping: 'marketplace.deal.phase.shipping',
  creating: 'marketplace.deal.phase.creating',
  publishing: 'marketplace.deal.phase.publishing',
  done: 'marketplace.deal.phase.done',
} as const satisfies Record<DealPhase, ParseKeys>;

type RoleActions<A> = Readonly<Record<DealRole, readonly A[]>>;

const NONE = { brand: [], creator: [] } as const satisfies RoleActions<never>;

/**
 * UX hint only, from the status alone (rule 06). Window- and flag-gated actions (cancel, withdraw,
 * dispute, upsell, rating, retention) are added by `getDealActions` from the deal's server fields.
 */
export const DEAL_STATUS_ACTIONS = {
  draft: { brand: ['sendOffer', 'editDraft', 'deleteDraft'], creator: [] },
  pending_influencer: { brand: ['withdrawOffer'], creator: ['accept', 'decline', 'requestExtension'] },
  negotiating_deadline: { brand: ['answerExtension'], creator: [] },
  awaiting_payment: { brand: ['fund'], creator: [] },
  escrow_locked: NONE,
  product_shipping: { brand: ['ship'], creator: ['receiveShipment', 'reportIssue'] },
  shipping_issue: { brand: ['answerIssue'], creator: [] },
  in_progress: NONE,
  disputed: NONE,
  completed: NONE,
  declined: NONE,
  expired: NONE,
  cancelled_pre_escrow: NONE,
  cancelled_payment_timeout: NONE,
  cancelled_by_brand: NONE,
  cancelled_with_kill_fee: NONE,
  cancelled_by_influencer: NONE,
  cancelled_shipping_timeout: NONE,
  creator_defaulted: NONE,
  resolved_refund: NONE,
  resolved_payout: NONE,
  resolved_split: NONE,
} as const satisfies Record<DealStatus, RoleActions<DealAction>>;

/** Per-deliverable hints while the deal is `in_progress`. */
export const DEAL_ITEM_ACTIONS = {
  pending: { brand: [], creator: ['submitDraft'] },
  draft_submitted: { brand: ['reviewDraft'], creator: [] },
  revision_requested: { brand: [], creator: ['submitDraft'] },
  approved_to_publish: { brand: [], creator: ['publish'] },
  verifying_live: { brand: ['verifyPost'], creator: [] },
  verified: { brand: [], creator: [] },
} as const satisfies Record<DealItemStatus, RoleActions<DealItemAction>>;

/** Draft review tones; `pending` = no decision yet (the server sends `review: null`). */
export const DEAL_DRAFT_REVIEW_TONE = {
  pending: 'info',
  approved: 'success',
  auto_approved: 'success',
  revision_requested: 'warning',
} as const satisfies Record<DealDraftDecision | 'pending', HueTone>;
