import {
  CheckCheck,
  CircleCheck,
  CircleQuestionMark,
  CircleX,
  Eye,
  Hourglass,
  PenLine,
  Send,
  TriangleAlert,
  Undo2,
  Wallet,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { DealStatus, DraftStatus } from '../types';

// Kept apart from the status maps so their jest tests never load the icon package.

export const DEAL_STATUS_ICON = {
  pending_approval: Hourglass,
  awaiting_payment: Wallet,
  in_progress: PenLine,
  under_review: Eye,
  ready_to_publish: CheckCheck,
  published: Send,
  completed: CircleCheck,
  disputed: TriangleAlert,
  cancelled: CircleX,
  refunded: Undo2,
} as const satisfies Record<DealStatus, LucideIcon>;

export const UNKNOWN_DEAL_STATUS_ICON: LucideIcon = CircleQuestionMark;

export const DRAFT_STATUS_ICON = {
  pending_review: Eye,
  approved: CircleCheck,
  changes_requested: PenLine,
} as const satisfies Record<DraftStatus, LucideIcon>;
