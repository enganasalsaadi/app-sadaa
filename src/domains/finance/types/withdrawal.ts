import type { CurrencyCode, Money } from '@/core/money';
import type { WithdrawalStatusParam } from '@/core/navigation';
import type { PaymentChannel } from './paymentChannel';
import type { ListPageMeta, MoneyDto } from './wallet';

export const WITHDRAWAL_STATUS = [
  'pending',
  'completed',
  'rejected',
  'cancelled',
  'returned',
] as const satisfies readonly WithdrawalStatusParam[];
export type WithdrawalStatus = (typeof WITHDRAWAL_STATUS)[number];

/** Why the server won't take a withdrawal right now (handoff §8). */
export const WITHDRAWAL_REASON_CODES = [
  'account_inactive',
  'kyc_required',
  'wallet_frozen',
  'withdrawals_paused',
  'below_minimum',
  'daily_limit_exceeded',
  'open_request_exists',
  'cooldown_active',
  'insufficient_funds',
  'fx_rate_stale',
  'currency_not_supported',
  'amount_below_fee',
] as const;
export type WithdrawalReasonCode = (typeof WITHDRAWAL_REASON_CODES)[number];

// ── Wire (docs/mobile-handoff-wallet.md §8) ─────────────────────────────────

export interface WithdrawalReasonDto {
  code: string;
  label?: string | null;
}

export interface WithdrawalQuoteDto {
  allowed: boolean;
  reasons?: WithdrawalReasonDto[] | null;
  next_allowed_at?: string | null;
  gross?: MoneyDto | null;
  fee?: MoneyDto | null;
  net?: MoneyDto | null;
  net_payout?: MoneyDto | null;
  exchange_rate?: string | null;
}

export interface WithdrawalDto {
  id: string;
  status: string;
  status_label: string;
  gross: MoneyDto;
  fee?: MoneyDto | null;
  net?: MoneyDto | null;
  net_payout?: MoneyDto | null;
  exchange_rate?: string | null;
  payout_currency?: string | null;
  channel?: string | null;
  destination_label?: string | null;
  receipt_number?: string | null;
  rejection_reason?: string | null;
  return_reason?: string | null;
  created_at: string;
  completed_at?: string | null;
  rejected_at?: string | null;
  cancelled_at?: string | null;
  returned_at?: string | null;
}

export interface WithdrawalsPageDto {
  items: WithdrawalDto[];
  meta: ListPageMeta;
}

// ── Domain ───────────────────────────────────────────────────────────────────

/** One blocker; `code: null` = a reason this build doesn't know (its server label still shows). */
export interface WithdrawalReason {
  code: WithdrawalReasonCode | null;
  /** Server label; `null` = the app's own words for the code. */
  label: string | null;
}

/** Live quote for the typed amount; amounts are `null` when the server can't price it. */
export interface WithdrawalQuote {
  allowed: boolean;
  reasons: WithdrawalReason[];
  next_allowed_at: string | null;
  /** Taken from the balance. */
  gross: Money | null;
  fee: Money | null;
  net: Money | null;
  /** What arrives, in the payout currency (rate locked when sent). */
  net_payout: Money | null;
  exchange_rate: string | null;
}

/** `POST` 201, list item and detail (handoff §8). */
export interface Withdrawal {
  id: string;
  /** `null` = a status this build doesn't know: the server label still shows. */
  status: WithdrawalStatus | null;
  status_label: string;
  gross: Money;
  fee: Money | null;
  net: Money | null;
  net_payout: Money | null;
  exchange_rate: string | null;
  channel: PaymentChannel | null;
  /** The server's copy of the destination, kept even if the method is deleted later. */
  destination_label: string | null;
  receipt_number: string | null;
  rejection_reason: string | null;
  return_reason: string | null;
  created_at: string;
  completed_at: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
  returned_at: string | null;
}

export interface WithdrawalsPage {
  items: Withdrawal[];
  meta: ListPageMeta;
}

export interface WithdrawalFilters {
  status?: WithdrawalStatus;
}

/** Query and POST body share the same three fields. */
export interface WithdrawalRequestBody {
  payout_method_id: string;
  /** Minor units of the wallet currency (USD cents). */
  amount_cents: number;
  payout_currency: CurrencyCode;
}

export interface CreateWithdrawalArgs {
  body: WithdrawalRequestBody;
  idempotencyKey: string;
}

export interface CancelWithdrawalArgs {
  id: string;
  idempotencyKey: string;
}

/** `422 withdrawal_not_allowed` meta, read from the error envelope. */
export interface WithdrawalBlock {
  reasons: WithdrawalReason[];
  next_allowed_at: string | null;
}
