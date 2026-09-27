// Mirrors the backend enums exactly (rule 06). Adding a value breaks every `Record<DealStatus, …>` map until it is handled.

export const DEAL_STATUS = [
  'pending_approval', // waiting creator acceptance
  'awaiting_payment', // waiting brand payment into escrow
  'in_progress', // creator producing content
  'under_review', // draft uploaded, brand reviewing
  'ready_to_publish', // draft approved
  'published', // proof link submitted, tracking window
  'completed', // funds released to creator wallet
  'disputed', // support intervention
  'cancelled',
  'refunded',
] as const;
export type DealStatus = (typeof DEAL_STATUS)[number];

export const isDealStatus = (value: unknown): value is DealStatus =>
  typeof value === 'string' && (DEAL_STATUS as readonly string[]).includes(value);

/** The side of the deal the viewer is on; comes from the server user object (rule 07). */
export type DealRole = 'creator' | 'brand';

/** Action endpoints the UI may offer (`POST deals/:id/<action>`); the server re-validates. */
export type DealAction =
  | 'accept'
  | 'decline'
  | 'pay'
  | 'submitDraft'
  | 'approveDraft'
  | 'requestChanges'
  | 'submitProof'
  | 'openDispute'
  | 'cancel';

export const DRAFT_STATUS = ['pending_review', 'approved', 'changes_requested'] as const;
export type DraftStatus = (typeof DRAFT_STATUS)[number];
