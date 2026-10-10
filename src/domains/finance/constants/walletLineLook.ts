import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Clock,
  Lock,
  ReceiptText,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';
import type { HueTone, ThemeColors } from '@/core/theme';
import type { WalletLineStatus, WalletTransaction, WalletTransactionType } from '../types';

/** What a line did to the money: picks the badge (rule 09 §2.1 ledger row and receipt). */
export type LineKind = 'in' | 'out' | 'hold' | 'fee' | 'other';

const TYPE_KIND = {
  top_up: 'in',
  escrow_hold: 'hold',
  escrow_release: 'in',
  escrow_refund: 'in',
  escrow_split: 'fee',
  withdrawal_request: 'out',
  withdrawal_cancel: 'in',
  withdrawal_reject: 'in',
  withdrawal_complete: 'out',
  withdrawal_returned: 'in',
  provider_fee: 'fee',
  admin_adjustment: 'other',
  promo_credit: 'in',
  reversal: 'other',
} as const satisfies Record<WalletTransactionType, LineKind>;

export const LINE_KIND_ICON = {
  in: ArrowDownLeft,
  out: ArrowUpRight,
  hold: Lock,
  fee: ReceiptText,
  other: ArrowLeftRight,
} as const satisfies Record<LineKind, LucideIcon>;

/** Pill of a line that is still open; final lines carry none (rule 09 §2.1). */
export const LINE_STATUS_PILL = {
  pending: { tone: 'warning', icon: Clock },
  held: { tone: 'info', icon: Lock },
  disputed: { tone: 'danger', icon: TriangleAlert },
} as const satisfies Record<WalletLineStatus, { tone: HueTone; icon: LucideIcon }>;

/** An unknown type falls back to the direction. */
export const lineKind = (line: WalletTransaction): LineKind =>
  line.type ? TYPE_KIND[line.type] : line.direction === 'credit' ? 'in' : 'out';

/** Badge fill + icon: mint only for money in (rule 08), info for escrow, neutral otherwise. */
export const lineBadgeColors = (kind: LineKind, colors: ThemeColors): { bg: string; icon: string } =>
  kind === 'in'
    ? { bg: colors.money.soft, icon: colors.money.main }
    : kind === 'hold'
      ? { bg: colors.status.info.soft, icon: colors.status.info.main }
      : { bg: colors.surface.elevated, icon: colors.icon.secondary };

/** "Type · subject" ("Escrow release · Nabd Café"). */
export const lineTitle = (line: WalletTransaction): string =>
  line.description ? `${line.type_label} · ${line.description}` : line.type_label;

/** Memo lines (escrow held for a creator) carry no sign and stay out of the balance. */
export const lineDisplayAmount = (line: WalletTransaction): WalletTransaction['amount'] =>
  line.affects_balance ? line.amount : { ...line.amount, amount: Math.abs(line.amount.amount) };
