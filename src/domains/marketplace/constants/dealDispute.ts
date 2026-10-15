import type { ParseKeys } from 'i18next';
import {
  CalendarX,
  Clapperboard,
  FileX,
  Gem,
  MessageCircleOff,
  MessageSquareText,
  PackageX,
  Repeat,
  ShieldX,
  Waypoints,
} from 'lucide-react-native';
import type { DealDisputeReason, DealRole } from '../types';
import type { DealReasonDef } from './dealChanges';

/** Server `deals.disputes` + `deals.publishing.max_url_length` (B10). Each side's caps cover the whole dispute. */
export const DEAL_DISPUTE_LIMITS = {
  minStatement: 20,
  maxStatement: 2000,
  maxNote: 2000,
  maxFiles: 10,
  maxLinks: 10,
  maxEntries: 20,
  maxRefs: 20,
  maxUrl: 2048,
  /** `sla_hours.dispute_evidence`: the evidence window's usual length (an admin may reopen it). */
  evidenceHours: 24,
} as const;

/** Each side picks from its own preset reasons (server `DealDisputeReasonEnum::forParty`). */
export const DEAL_DISPUTE_REASONS = {
  brand: ['brief_not_followed', 'poor_quality', 'missed_deadlines', 'unresponsive', 'live_post_issue', 'other'],
  creator: ['scope_change', 'brand_unresponsive', 'product_issue', 'unfair_rejection', 'excessive_revisions', 'other'],
} as const satisfies Record<DealRole, readonly DealDisputeReason[]>;

export const DEAL_DISPUTE_REASON_DEF = {
  brief_not_followed: { label: 'marketplace.deals.dispute.reasons.brief_not_followed', icon: FileX },
  poor_quality: { label: 'marketplace.deals.dispute.reasons.poor_quality', icon: Gem },
  missed_deadlines: { label: 'marketplace.deals.dispute.reasons.missed_deadlines', icon: CalendarX },
  unresponsive: { label: 'marketplace.deals.dispute.reasons.unresponsive', icon: MessageCircleOff },
  live_post_issue: { label: 'marketplace.deals.dispute.reasons.live_post_issue', icon: Clapperboard },
  excessive_revisions: { label: 'marketplace.deals.dispute.reasons.excessive_revisions', icon: Repeat },
  scope_change: { label: 'marketplace.deals.dispute.reasons.scope_change', icon: Waypoints },
  brand_unresponsive: { label: 'marketplace.deals.dispute.reasons.brand_unresponsive', icon: MessageCircleOff },
  product_issue: { label: 'marketplace.deals.dispute.reasons.product_issue', icon: PackageX },
  unfair_rejection: { label: 'marketplace.deals.dispute.reasons.unfair_rejection', icon: ShieldX },
  other: { label: 'marketplace.deals.dispute.reasons.other', icon: MessageSquareText },
} as const satisfies Record<DealDisputeReason, DealReasonDef>;

/** Why no dispute can open (`dispute_window.closed_reason`); unknown codes get the plain line. */
export const DEAL_DISPUTE_CLOSED_COPY: Readonly<Record<string, ParseKeys>> = {
  limit: 'marketplace.deals.dispute.open.closedLimit',
  deal_status: 'marketplace.deals.dispute.open.closedStatus',
};

export const DEAL_DISPUTE_CLOSED_FALLBACK: ParseKeys = 'marketplace.deals.dispute.open.closedOther';
