import type { ParseKeys } from 'i18next';
import type { HueTone } from '@/core/theme';
import type { DealReturnStatus } from '../types';

export interface DealReturnStatusMeta {
  /** Amber = owed by the creator · teal = on its way · green = done · grey = let go; red is the late waybill. */
  tone: HueTone;
  /** Where the parcel sits on the creator → brand route, 0 (with the creator) to 1 (arrived). */
  progress: number;
  /** The creator may still (re)enter the waybill: until the brand answers. */
  editable: boolean;
  /** Only the way back is moving: the parcel travels, the lock is open. */
  moving: boolean;
}

export const DEAL_RETURN_STATUS_META = {
  awaiting_waybill: { tone: 'warning', progress: 0, editable: true, moving: false },
  shipped: { tone: 'interactive', progress: 0.5, editable: true, moving: true },
  received: { tone: 'success', progress: 1, editable: false, moving: false },
  issue_reported: { tone: 'warning', progress: 1, editable: false, moving: false },
  waived: { tone: 'neutral', progress: 0, editable: false, moving: false },
} as const satisfies Record<DealReturnStatus, DealReturnStatusMeta>;

/** A status this build doesn't know yet: grey, nothing to do, the server's label says the rest. */
export const UNKNOWN_DEAL_RETURN_STATUS_META: DealReturnStatusMeta = {
  tone: 'neutral',
  progress: 0,
  editable: false,
  moving: false,
};

/** Contract §5.5: the creator has five days to enter the waybill (display only, the due date is the server's). */
export const DEAL_RETURN_WINDOW_DAYS = 5;

/** «When did you hand it over»: today is the default (the field is left out), then yesterday, then N days back. */
export const DEAL_RETURN_HANDED = ['today', 'yesterday', 'earlier'] as const;
export type DealReturnHanded = (typeof DEAL_RETURN_HANDED)[number];

export const DEAL_RETURN_HANDED_LABEL = {
  today: 'marketplace.deals.return.sheet.handed.today',
  yesterday: 'marketplace.deals.return.sheet.handed.yesterday',
  earlier: 'marketplace.deals.return.sheet.handed.earlier',
} as const satisfies Record<DealReturnHanded, ParseKeys>;

/** «N days ago» steps from 2 up to the waybill window (the server refuses a date before the deal was funded). */
export const DEAL_RETURN_EARLIER_DAYS = { min: 2, max: 14 } as const;

/** Contract §5.5 limits for the brand's answers: the report note, its photos, the waive note. */
export const DEAL_RETURN_LIMITS = { issueNoteMin: 5, issueNoteMax: 1000, waiveNote: 500, issuePhotos: 5 } as const;
