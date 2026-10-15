import type { ParseKeys } from 'i18next';
import {
  CalendarClock,
  CalendarX,
  FileQuestionMark,
  HeartCrack,
  MessageSquareText,
  PackageX,
  Puzzle,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import type { DealBrandCancelReason, DealUpsellDeclineReason, DealWithdrawReason } from '../types';

/** A reason tile: its words and its mark. */
export interface DealReasonDef {
  label: ParseKeys;
  icon: LucideIcon;
}

/** The brand's four reasons to cancel (M8). */
export const DEAL_CANCEL_REASON_DEF = {
  no_longer_needed: { label: 'marketplace.deals.changes.cancel.reasons.no_longer_needed', icon: PackageX },
  budget_changed: { label: 'marketplace.deals.changes.cancel.reasons.budget_changed', icon: Wallet },
  timing_changed: { label: 'marketplace.deals.changes.cancel.reasons.timing_changed', icon: CalendarClock },
  other: { label: 'marketplace.deals.changes.cancel.reasons.other', icon: MessageSquareText },
} as const satisfies Record<DealBrandCancelReason, DealReasonDef>;

/** The creator's four reasons to withdraw (M8). */
export const DEAL_WITHDRAW_REASON_DEF = {
  schedule_conflict: { label: 'marketplace.deals.changes.withdraw.reasons.schedule_conflict', icon: CalendarX },
  personal: { label: 'marketplace.deals.changes.withdraw.reasons.personal', icon: HeartCrack },
  brief_concern: { label: 'marketplace.deals.changes.withdraw.reasons.brief_concern', icon: FileQuestionMark },
  other: { label: 'marketplace.deals.changes.withdraw.reasons.other', icon: MessageSquareText },
} as const satisfies Record<DealWithdrawReason, DealReasonDef>;

/** The creator's three reasons to turn an addendum down (M8). */
export const DEAL_UPSELL_DECLINE_REASON_DEF = {
  schedule_full: { label: 'marketplace.deals.changes.upsells.decline.reasons.schedule_full', icon: CalendarX },
  not_a_fit: { label: 'marketplace.deals.changes.upsells.decline.reasons.not_a_fit', icon: Puzzle },
  other: { label: 'marketplace.deals.changes.upsells.decline.reasons.other', icon: MessageSquareText },
} as const satisfies Record<DealUpsellDeclineReason, DealReasonDef>;
