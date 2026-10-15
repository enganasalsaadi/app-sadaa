import type { ParseKeys } from 'i18next';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  EyeOff,
  MessageSquareText,
  PenLine,
  RotateCcw,
  Scale,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import type { HueTone } from '@/core/theme';
import {
  DEAL_RETENTION_REASON,
  type DealRetentionReason,
  type DealRetentionTerm,
} from '../types/deal';
import type { DealRetentionPhase } from '../utils/dealRetention';
import type { DealReasonDef } from './dealChanges';

/** Server `deals.retention` + `deals.publishing.max_url_length` + `sla_hours.retention_*` (B10). */
export const DEAL_RETENTION_LIMITS = {
  maxNote: 1000,
  maxUrl: 2048,
  /** The creator's time to restore or contest, then the brand's to confirm (cards count down `due_at`). */
  answerHours: 24,
  confirmHours: 24,
} as const;

/** What the brand saw happen to the post (server `DealRetentionReasonEnum`), in the order they show. */
export const DEAL_RETENTION_REASONS = DEAL_RETENTION_REASON;

export const DEAL_RETENTION_REASON_DEF = {
  deleted: {
    label: 'marketplace.deals.retention.reasons.deleted',
    icon: Trash2,
  },
  made_private: {
    label: 'marketplace.deals.retention.reasons.made_private',
    icon: EyeOff,
  },
  edited: {
    label: 'marketplace.deals.retention.reasons.edited',
    icon: PenLine,
  },
  other: {
    label: 'marketplace.deals.retention.reasons.other',
    icon: MessageSquareText,
  },
} as const satisfies Record<DealRetentionReason, DealReasonDef>;

/** The agreed period as a length («30 يوماً»), for «of 30 days» and «stayed 30 days». */
export const DEAL_RETENTION_SPAN = {
  '24h': 'marketplace.deals.retention.span.24h',
  '30d': 'marketplace.deals.retention.span.30d',
  '90d': 'marketplace.deals.retention.span.90d',
  '180d': 'marketplace.deals.retention.span.180d',
  permanent: 'marketplace.deals.retention.span.permanent',
} as const satisfies Record<DealRetentionTerm, ParseKeys>;

/**
 * A case card's band per phase and side: tone, icon, title (`{{name}}` = the other side). Status is
 * never color-only: the title says it. A closed case with an unknown code shows the server label.
 */
export const DEAL_RETENTION_PHASE_LOOK = {
  awaitingCreator: {
    tone: 'warning',
    icon: { brand: Clock, creator: AlertTriangle },
    title: {
      brand: 'marketplace.deals.retention.case.title.awaitingCreator.brand',
      creator: 'marketplace.deals.retention.case.title.awaitingCreator.creator',
    },
  },
  awaitingBrand: {
    tone: 'success',
    icon: { brand: RotateCcw, creator: Clock },
    title: {
      brand: 'marketplace.deals.retention.case.title.awaitingBrand.brand',
      creator: 'marketplace.deals.retention.case.title.awaitingBrand.creator',
    },
  },
  escalated: {
    tone: 'neutral',
    icon: { brand: Scale, creator: Scale },
    title: {
      brand: 'marketplace.deals.retention.case.title.escalated',
      creator: 'marketplace.deals.retention.case.title.escalated',
    },
  },
  restored: {
    tone: 'success',
    icon: { brand: CheckCircle2, creator: CheckCircle2 },
    title: {
      brand: 'marketplace.deals.retention.case.title.restored',
      creator: 'marketplace.deals.retention.case.title.restored',
    },
  },
  upheld: {
    tone: 'danger',
    icon: { brand: Scale, creator: Scale },
    title: {
      brand: 'marketplace.deals.retention.case.title.upheld',
      creator: 'marketplace.deals.retention.case.title.upheld',
    },
  },
  dismissed: {
    tone: 'neutral',
    icon: { brand: ShieldCheck, creator: ShieldCheck },
    title: {
      brand: 'marketplace.deals.retention.case.title.dismissed',
      creator: 'marketplace.deals.retention.case.title.dismissed',
    },
  },
  closed: {
    tone: 'neutral',
    icon: { brand: CheckCircle2, creator: CheckCircle2 },
    title: null,
  },
} as const satisfies Record<
  DealRetentionPhase,
  {
    tone: HueTone;
    icon: Record<'brand' | 'creator', LucideIcon>;
    title: Record<'brand' | 'creator', ParseKeys> | null;
  }
>;
