import type { CurrencyCode, Money } from '@/core/money';

/** Wallet rules (rule 06): brands deposit and pay, creators withdraw only. */
export type WalletRole = 'creator' | 'brand';

/** Every amount on the wire (handoff §2). `formatted` is ignored: `MoneyText` formats from `amount`. */
export interface MoneyDto {
  amount: number;
  formatted: string;
  currency: string;
}

export const WALLET_STATUS = ['active', 'frozen', 'closed'] as const;
export type WalletStatus = (typeof WALLET_STATUS)[number];

/** Wallet v4 delta (`docs/backend/wallet-v4-prompt.md` §1): absent on servers that predate it. */
export interface WalletSummaryDto {
  month_in?: MoneyDto | null;
  escrow?: MoneyDto | null;
  pending_top_ups?: MoneyDto | null;
}

export interface WalletDto {
  id: string;
  status: string;
  status_label: string;
  currency: string;
  available: MoneyDto;
  pending: MoneyDto;
  total: MoneyDto;
  summary?: WalletSummaryDto | null;
}

/** Hero extras. Each field is `null` until the server sends it; its tile or pill stays hidden. */
export interface WalletSummary {
  /** Credits that entered the wallet this calendar month. */
  month_in: Money | null;
  /** Creator: net held on active deals (not in the balance yet). Brand: same as `pending`. */
  escrow: Money | null;
  /** Brand only: top-ups waiting for review. */
  pending_top_ups: Money | null;
}

/** `GET /wallet` (handoff §5). `available` is 0 while frozen; `pending` = open withdrawals or escrow. */
export interface Wallet {
  id: string;
  /** `null` = a status this build doesn't know: show `status_label`, allow nothing. */
  status: WalletStatus | null;
  status_label: string;
  currency: CurrencyCode;
  available: Money;
  pending: Money;
  total: Money;
  summary: WalletSummary;
}

export const WALLET_TRANSACTION_TYPES = [
  'top_up',
  'escrow_hold',
  'escrow_release',
  'escrow_refund',
  'escrow_split',
  'withdrawal_request',
  'withdrawal_cancel',
  'withdrawal_reject',
  'withdrawal_complete',
  'withdrawal_returned',
  'provider_fee',
  'admin_adjustment',
  'promo_credit',
  'reversal',
] as const;
export type WalletTransactionType = (typeof WALLET_TRANSACTION_TYPES)[number];

export type TransactionDirection = 'credit' | 'debit';

export interface TransactionSource {
  type: string;
  id: string;
}

export interface CounterpartyDto {
  type: string;
  id?: string | null;
  name: string;
  avatar_url?: string | null;
}

/** Who is on the other side of a line or escrow (brand, creator, payout or top-up channel). */
export interface Counterparty {
  type: string;
  id: string | null;
  name: string;
  avatar_url: string | null;
}

/** A line whose lifecycle is still open (v4 delta §4); `null` once final. */
export const WALLET_LINE_STATUS = ['pending', 'held'] as const;
export type WalletLineStatus = (typeof WALLET_LINE_STATUS)[number];

export interface WalletTransactionDto {
  reference: string;
  type: string;
  type_label: string;
  direction: string;
  amount: MoneyDto;
  balance_after: MoneyDto;
  original?: MoneyDto | null;
  exchange_rate?: string | null;
  source?: TransactionSource | null;
  details?: Record<string, unknown> | null;
  created_at: string;
  description?: string | null;
  counterparty?: CounterpartyDto | null;
  status?: string | null;
  status_label?: string | null;
  affects_balance?: boolean | null;
}

/** A statement line or receipt (handoff §5). Display `type_label`; `type` only picks the icon. */
export interface WalletTransaction {
  reference: string;
  /** `null` = a type this build doesn't know: neutral icon, server label. */
  type: WalletTransactionType | null;
  type_label: string;
  direction: TransactionDirection;
  /** Signed: negative for debits. */
  amount: Money;
  balance_after: Money;
  /** The amount as paid in another currency (SYP top-up), with the rate used. */
  original: Money | null;
  /** Decimal string (`"14000.0000"`): never parsed into float math. */
  exchange_rate: string | null;
  source: TransactionSource | null;
  details: Record<string, unknown>;
  created_at: string;
  /** Subject shown after the type ("Escrow release · Nabd Café"). */
  description: string | null;
  counterparty: Counterparty | null;
  /** `null` = final (or a status this build doesn't know: the label still shows). */
  status: WalletLineStatus | null;
  /** Pill text while the line is open. */
  status_label: string | null;
  /** `false` = memo line (escrow held for a creator): no sign, not in the balance. */
  affects_balance: boolean;
}

/** List meta (contract: `{ items, meta: { current_page, last_page, total } }`). */
export interface ListPageMeta {
  current_page: number;
  last_page: number;
  total: number;
}

export interface WalletTransactionsPageDto {
  items: WalletTransactionDto[];
  meta: ListPageMeta;
}

export interface WalletTransactionsPage {
  items: WalletTransaction[];
  meta: ListPageMeta;
}

export interface WalletTransactionFilters {
  type?: WalletTransactionType;
  /** `YYYY-MM-DD`, inclusive. */
  from?: string;
  to?: string;
}

export interface ExchangeRateDto {
  rate: string;
  quote: string;
  base: string;
  source: string;
  is_stale: boolean;
  locked_until: string | null;
  effective_at: string;
}

/** `GET /finance/exchange-rate`. `is_stale` → SYP options off + a notice. */
export interface ExchangeRate {
  /** Units of `quote` per 1 `base`, decimal string. */
  rate: string;
  base: CurrencyCode;
  quote: CurrencyCode;
  source: string;
  is_stale: boolean;
  locked_until: string | null;
  effective_at: string;
}

export interface WalletEscrowDto {
  deal_id: string;
  deal_title: string;
  counterparty?: CounterpartyDto | null;
  amount: MoneyDto;
  status: string;
  status_label: string;
  release_hint?: string | null;
  held_at: string;
}

export interface WalletEscrowsDto {
  items: WalletEscrowDto[];
  meta: ListPageMeta & { total_amount?: MoneyDto | null };
}

/** Money held on one active deal (v4 delta §2). Creator: net to receive · brand: gross held. */
export interface WalletEscrow {
  deal_id: string;
  deal_title: string;
  counterparty: Counterparty | null;
  amount: Money;
  status_label: string;
  /** What releases the money at the deal's current stage. */
  release_hint: string | null;
  held_at: string;
}

/** `GET /wallet/escrows`: the deals closest to release first. */
export interface WalletEscrows {
  items: WalletEscrow[];
  /** Every active escrow, not only this page. */
  count: number;
  /** `null` when the server leaves it out: the card then sums nothing and shows the first deal. */
  total_amount: Money | null;
}

export const EARNINGS_PERIODS = ['6m', '12m'] as const;
export type EarningsPeriod = (typeof EARNINGS_PERIODS)[number];

export interface EarningsBucketDto {
  /** `YYYY-MM`, Asia/Damascus. */
  month: string;
  amount: MoneyDto;
}

export interface WalletEarningsDto {
  period: string;
  total: MoneyDto;
  buckets: EarningsBucketDto[];
  current_month: string;
}

export interface EarningsBucket {
  month: string;
  amount: Money;
}

/** `GET /wallet/earnings` (v4 delta §3): creator = net releases · brand = campaign spend. */
export interface WalletEarnings {
  total: Money;
  /** Every month of the period, zero months included, oldest first. */
  buckets: EarningsBucket[];
  current_month: string;
}
