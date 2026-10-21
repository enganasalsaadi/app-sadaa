import type { ParseKeys } from 'i18next';
import {
  ArrowLeftRight,
  Clock,
  MessageSquareText,
  PackageMinus,
  PackageX,
  type LucideIcon,
} from 'lucide-react-native';
import type { DealShippingIssueReason } from '../types';

/** A courier's market code, or «other» for one the brand types (sent with `courier_name`). */
export type DealCourierChoice = string;
export const DEAL_COURIER_OTHER = 'other';

/**
 * The creator's five shipping problems (server `DealShippingIssueReasonEnum`), as tiles.
 * `photos`: the server requires 1–5 photos for these.
 */
export const DEAL_ISSUE_REASON_DEF = {
  damaged: {
    label: 'marketplace.deals.shipping.issue.reasons.damaged',
    icon: PackageX,
    photos: true,
  },
  incomplete: {
    label: 'marketplace.deals.shipping.issue.reasons.incomplete',
    icon: PackageMinus,
    photos: true,
  },
  wrong_item: {
    label: 'marketplace.deals.shipping.issue.reasons.wrong_item',
    icon: ArrowLeftRight,
    photos: true,
  },
  delayed: {
    label: 'marketplace.deals.shipping.issue.reasons.delayed',
    icon: Clock,
    photos: false,
  },
  other: {
    label: 'marketplace.deals.shipping.issue.reasons.other',
    icon: MessageSquareText,
    photos: false,
  },
} as const satisfies Record<
  DealShippingIssueReason,
  { label: ParseKeys; icon: LucideIcon; photos: boolean }
>;

/** Tile order in the issue sheet: what's in the box first, the clock-gated one last but one. */
export const DEAL_ISSUE_REASON_ORDER = [
  'damaged',
  'incomplete',
  'wrong_item',
  'delayed',
  'other',
] as const satisfies readonly DealShippingIssueReason[];

/** Mirrors the server's shipment and address rules (handoff M5, B5.1). */
export const DEAL_SHIPPING_LIMITS = {
  courier: 100,
  trackingNo: 100,
  trackingUrl: 2048,
  issueNote: 500,
  issuePhotos: 5,
  address: {
    recipientName: { min: 2, max: 100 },
    city: { min: 2, max: 100 },
    area: { min: 2, max: 150 },
    addressLine: { min: 5, max: 255 },
    landmark: 150,
    notes: 300,
  },
} as const;
