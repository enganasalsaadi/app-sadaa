import type { ParseKeys } from 'i18next';
import {
  CalendarX,
  MessageSquareText,
  Puzzle,
  TreePalm,
  type LucideIcon,
} from 'lucide-react-native';
import type { DealDeclineReason } from '../types';

/** The creator's four ways to decline (server `DealDeclineReasonEnum`), as tiles. */
export const DEAL_DECLINE_REASON_DEF = {
  schedule_full: {
    label: 'marketplace.deals.respond.decline.reasons.schedule_full',
    icon: CalendarX,
  },
  not_a_fit: {
    label: 'marketplace.deals.respond.decline.reasons.not_a_fit',
    icon: Puzzle,
  },
  vacation: {
    label: 'marketplace.deals.respond.decline.reasons.vacation',
    icon: TreePalm,
  },
  other: {
    label: 'marketplace.deals.respond.decline.reasons.other',
    icon: MessageSquareText,
  },
} as const satisfies Record<
  DealDeclineReason,
  { label: ParseKeys; icon: LucideIcon }
>;
