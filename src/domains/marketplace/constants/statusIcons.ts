import {
  BadgeCheck,
  CalendarClock,
  CircleCheck,
  CircleQuestionMark,
  CircleSlash,
  CircleX,
  Eye,
  FilePen,
  Gavel,
  Hourglass,
  Lock,
  PackageX,
  PenLine,
  Radar,
  Scale,
  Send,
  ShieldAlert,
  Timer,
  Truck,
  Undo2,
  UserX,
  Wallet,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { DealDraftDecision, DealItemStatus, DealStatus } from '../types';

// Kept apart from the status maps so their jest tests never load the icon package.

export const DEAL_STATUS_ICON = {
  draft: FilePen,
  pending_influencer: Hourglass,
  negotiating_deadline: CalendarClock,
  awaiting_payment: Wallet,
  escrow_locked: Lock,
  product_shipping: Truck,
  shipping_issue: PackageX,
  in_progress: PenLine,
  disputed: Gavel,
  completed: CircleCheck,
  declined: CircleX,
  expired: Timer,
  cancelled_pre_escrow: CircleSlash,
  cancelled_payment_timeout: Timer,
  cancelled_by_brand: CircleSlash,
  cancelled_with_kill_fee: Scale,
  cancelled_by_influencer: CircleSlash,
  cancelled_shipping_timeout: PackageX,
  creator_defaulted: UserX,
  resolved_refund: Undo2,
  resolved_payout: BadgeCheck,
  resolved_split: Scale,
} as const satisfies Record<DealStatus, LucideIcon>;

export const UNKNOWN_DEAL_STATUS_ICON: LucideIcon = CircleQuestionMark;

export const DEAL_ITEM_STATUS_ICON = {
  pending: PenLine,
  draft_submitted: Eye,
  revision_requested: ShieldAlert,
  approved_to_publish: Send,
  verifying_live: Radar,
  verified: BadgeCheck,
} as const satisfies Record<DealItemStatus, LucideIcon>;

export const DEAL_DRAFT_REVIEW_ICON = {
  pending: Eye,
  approved: CircleCheck,
  auto_approved: CircleCheck,
  revision_requested: PenLine,
} as const satisfies Record<DealDraftDecision | 'pending', LucideIcon>;
