import type { CurrencyCode, Money } from '@/core/money';
import type { TopUpStatusParam } from '@/core/navigation';
import type { ListPageMeta, MoneyDto } from './wallet';

/** Where a brand sends the money from (handoff §6). */
export const TOP_UP_CHANNELS = ['haram', 'fouad', 'syriatel_cash', 'mtn_cash', 'bank'] as const;
export type TopUpChannel = (typeof TOP_UP_CHANNELS)[number];

/** The channel picker's sections, in this order unless the server orders them. */
export const TOP_UP_CHANNEL_GROUPS = ['exchange_office', 'e_wallet', 'bank'] as const;
export type TopUpChannelGroup = (typeof TOP_UP_CHANNEL_GROUPS)[number];

export const TOP_UP_STATUS = [
  'pending_review',
  'completed',
  'rejected',
  'reversed',
] as const satisfies readonly TopUpStatusParam[];
export type TopUpStatus = (typeof TOP_UP_STATUS)[number];

/** Why a channel is dimmed (top-ups v2 §1). */
export const TOP_UP_DISABLED_REASONS = ['channel_paused', 'fx_rate_stale', 'fx_rate_unavailable'] as const;
export type TopUpDisabledReason = (typeof TOP_UP_DISABLED_REASONS)[number];

// ── Wire (docs/mobile-handoff-topup-v2.md) ─────────────────────────────────

export interface TopUpLimitDto {
  min: MoneyDto;
  max: MoneyDto;
}

export interface TopUpAccountFieldDto {
  key: string;
  label: string;
  value: string;
  copyable: boolean;
}

export interface TopUpAccountDto {
  id: string;
  fields: TopUpAccountFieldDto[];
}

export interface TopUpChannelDto {
  channel: string;
  label: string;
  group: string;
  group_label?: string | null;
  currencies: string[];
  enabled: boolean;
  disabled_reason?: string | null;
  disabled_label?: string | null;
  limits?: Record<string, TopUpLimitDto> | null;
  accounts?: TopUpAccountDto[] | null;
  instructions?: string | null;
  processing_time_label?: string | null;
}

export interface TopUpRateDto {
  rate: string;
  is_stale: boolean;
  effective_at: string;
}

export interface TopUpChannelsDto {
  channels: TopUpChannelDto[];
  exchange_rate?: TopUpRateDto | null;
  /** Stable per-brand code (`SD-XXXXXXXX`) for the transfer note (top-ups v2 §1). */
  payer_reference?: string | null;
}

export interface TopUpReceiptDto {
  url: string;
  mime_type: string;
  size_bytes?: number | null;
  name?: string | null;
  expires_at?: string | null;
}

export interface TopUpDto {
  id: string;
  status: string;
  status_label: string;
  channel: string;
  channel_label?: string | null;
  amount: MoneyDto;
  amount_usd?: MoneyDto | null;
  exchange_rate?: string | null;
  transfer_reference: string;
  receipt?: TopUpReceiptDto | null;
  rejection_reason?: string | null;
  reversal_reason?: string | null;
  transaction_reference?: string | null;
  submitted_at?: string | null;
  /** Phase 1 servers may only send this one. */
  created_at?: string | null;
  reviewed_at?: string | null;
  completed_at?: string | null;
  reversed_at?: string | null;
}

export interface TopUpsPageDto {
  items: TopUpDto[];
  meta: ListPageMeta;
}

// ── Domain ───────────────────────────────────────────────────────────────────

export interface TopUpLimits {
  min: Money;
  max: Money;
}

/** One line of Sada's receiving account ("Recipient name", copyable). */
export interface TopUpAccountField {
  key: string;
  label: string;
  value: string;
  copyable: boolean;
}

export interface TopUpAccount {
  id: string;
  fields: TopUpAccountField[];
}

/** One way to send money to Sada; labels are localized (server, or the app's own words on the fallback). */
export interface TopUpChannelOption {
  channel: TopUpChannel;
  label: string;
  group: TopUpChannelGroup;
  groupLabel: string;
  /** Accepted right now (SYP drops out while the rate is stale). */
  currencies: CurrencyCode[];
  enabled: boolean;
  disabledReason: TopUpDisabledReason | null;
  disabledLabel: string | null;
  limits: Partial<Record<CurrencyCode, TopUpLimits>>;
  /** Empty = the app can't say where to send: the brand asks support. */
  accounts: TopUpAccount[];
  instructions: string | null;
  processingTimeLabel: string | null;
}

/** USD → SYP rate snapshot that rides on the channels response. */
export interface TopUpRate {
  /** SYP per 1 USD, decimal string: never parsed into float math. */
  rate: string;
  is_stale: boolean;
  effective_at: string;
}

export interface TopUpChannels {
  channels: TopUpChannelOption[];
  rate: TopUpRate | null;
  /** The brand writes it in the transfer note so finance can match the payment; optional. */
  payerReference: string | null;
  /** `fallback` = built on the device because the server predates the endpoint. */
  source: 'server' | 'fallback';
}

export interface TopUpReceipt {
  /** Signed URL, owner only, no auth header; dead after `expires_at` (refetch the detail). */
  url: string;
  mime_type: string;
  name: string | null;
  size_bytes: number | null;
  expires_at: string | null;
}

/** `POST` 201, list item and detail (handoff §6 + top-ups v2 §2). */
export interface TopUp {
  id: string;
  /** `null` = a status this build doesn't know: the server label still shows. */
  status: TopUpStatus | null;
  status_label: string;
  /** `null` = unknown channel: `channel_label` (or nothing) names it. */
  channel: TopUpChannel | null;
  channel_label: string | null;
  /** What the brand sent, in the sent currency. */
  amount: Money;
  /** What is (or will be) credited; locked at submission (rate fixed then, top-ups v2 §5.1). */
  amount_usd: Money | null;
  exchange_rate: string | null;
  transfer_reference: string;
  receipt: TopUpReceipt | null;
  rejection_reason: string | null;
  reversal_reason: string | null;
  /** The ledger line once credited (opens its receipt). */
  transaction_reference: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  completed_at: string | null;
  reversed_at: string | null;
}

export interface TopUpsPage {
  items: TopUp[];
  meta: ListPageMeta;
}

export interface TopUpFilters {
  status?: TopUpStatus;
}

export interface CreateTopUpArgs {
  body: FormData;
  idempotencyKey: string;
}
