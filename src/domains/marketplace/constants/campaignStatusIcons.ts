import {
  Archive,
  Ban,
  CircleCheck,
  CircleDashed,
  CirclePause,
  CircleQuestionMark,
  CircleSlash,
  CircleX,
  FilePen,
  FileClock,
  FileX,
  Hourglass,
  ShieldX,
  Timer,
  UserCheck,
  Users,
  Undo2,
  Bookmark,
  BadgeCheck,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { ApplicationStatus, CampaignStatus } from '../types';

// Kept apart from the status maps so their jest tests never load the icon package.

export const CAMPAIGN_STATUS_ICON = {
  draft: FilePen,
  pending_review: Hourglass,
  changes_requested: FileClock,
  open: Users,
  suspended: CirclePause,
  filled: UserCheck,
  closed: Archive,
  completed: BadgeCheck,
  cancelled: CircleSlash,
  rejected: FileX,
  removed: ShieldX,
} as const satisfies Record<CampaignStatus, LucideIcon>;

export const UNKNOWN_CAMPAIGN_STATUS_ICON: LucideIcon = CircleQuestionMark;

export const APPLICATION_STATUS_ICON = {
  submitted: Hourglass,
  shortlisted: Bookmark,
  selected: CircleCheck,
  withdrawn: Undo2,
  expired: Timer,
  rejected: CircleX,
  not_selected: CircleDashed,
  cancelled: Ban,
} as const satisfies Record<ApplicationStatus, LucideIcon>;

export const UNKNOWN_APPLICATION_STATUS_ICON: LucideIcon = CircleQuestionMark;
