import { isCurrencyCode } from '@/core/money';
import type { CurrencyCode } from '@/core/money';
import {
  PAYMENT_CHANNEL_GROUPS,
  TOP_UP_DISABLED_REASONS,
  TOP_UP_STATUS,
} from '../types';
import type {
  TopUp,
  TopUpAccount,
  TopUpAccountDto,
  TopUpChannelDto,
  TopUpChannelOption,
  TopUpChannels,
  TopUpChannelsDto,
  TopUpDto,
  TopUpLimitDto,
  TopUpLimits,
  TopUpReceiptDto,
  TopUpReceipt,
  TopUpsPage,
  TopUpsPageDto,
} from '../types';
import { isOneOf, toMoney, toOptionalMoney } from './walletMappers';

const toCurrencies = (values: readonly string[]): CurrencyCode[] =>
  values.filter((value): value is CurrencyCode => isCurrencyCode(value));

const toLimits = (dto: Record<string, TopUpLimitDto> | null | undefined) => {
  const limits: Partial<Record<CurrencyCode, TopUpLimits>> = {};
  for (const [currency, range] of Object.entries(dto ?? {})) {
    const min = toOptionalMoney(range.min);
    const max = toOptionalMoney(range.max);
    if (isCurrencyCode(currency) && min && max && min.currency === currency && max.currency === currency) {
      limits[currency] = { min, max };
    }
  }
  return limits;
};

const toAccounts = (dtos: TopUpAccountDto[] | null | undefined): TopUpAccount[] =>
  (dtos ?? []).flatMap(account => {
    const fields = account.fields.filter(field => field.value.trim() !== '');
    return fields.length > 0 ? [{ id: account.id, fields }] : [];
  });

/** The server's list is the market's: any channel code is kept. A group this build can't section is dropped. */
const mapChannel = (dto: TopUpChannelDto): TopUpChannelOption[] => {
  if (!dto.channel || !isOneOf(PAYMENT_CHANNEL_GROUPS, dto.group)) return [];
  const group = dto.group;
  const currencies = toCurrencies(dto.currencies);
  const reason =
    dto.disabled_reason && isOneOf(TOP_UP_DISABLED_REASONS, dto.disabled_reason) ? dto.disabled_reason : null;
  return [
    {
      channel: dto.channel,
      label: dto.label,
      group,
      groupLabel: dto.group_label || dto.group,
      currencies,
      // Nothing to send in = nothing to pick, whatever the flag says.
      enabled: dto.enabled && currencies.length > 0,
      disabledReason: reason,
      disabledLabel: dto.disabled_label || null,
      limits: toLimits(dto.limits),
      accounts: toAccounts(dto.accounts),
      instructions: dto.instructions || null,
      processingTimeLabel: dto.processing_time_label || null,
    },
  ];
};

/** `GET /wallet/top-ups/channels` (top-ups v2 §1). */
export const mapTopUpChannels = (dto: TopUpChannelsDto): TopUpChannels => ({
  channels: dto.channels.flatMap(mapChannel),
  rate: dto.exchange_rate
    ? { rate: dto.exchange_rate.rate, is_stale: dto.exchange_rate.is_stale, effective_at: dto.exchange_rate.effective_at }
    : null,
  payerReference: dto.payer_reference?.trim() || null,
});

const toReceipt = (dto: TopUpReceiptDto | null | undefined): TopUpReceipt | null =>
  dto?.url
    ? {
        url: dto.url,
        mime_type: dto.mime_type,
        name: dto.name || null,
        size_bytes: dto.size_bytes ?? null,
        expires_at: dto.expires_at || null,
      }
    : null;

/** One top-up; an unsupported currency fails it (a detail becomes a query error, a list skips it). */
export const mapTopUp = (dto: TopUpDto): TopUp => ({
  id: dto.id,
  status: isOneOf(TOP_UP_STATUS, dto.status) ? dto.status : null,
  status_label: dto.status_label,
  channel: dto.channel || null,
  channel_label: dto.channel_label || null,
  amount: toMoney(dto.amount),
  amount_usd: toOptionalMoney(dto.amount_usd),
  exchange_rate: dto.exchange_rate || null,
  transfer_reference: dto.transfer_reference,
  receipt: toReceipt(dto.receipt),
  rejection_reason: dto.rejection_reason || null,
  reversal_reason: dto.reversal_reason || null,
  transaction_reference: dto.transaction_reference || null,
  submitted_at: dto.submitted_at || dto.created_at || '',
  reviewed_at: dto.reviewed_at || null,
  completed_at: dto.completed_at || null,
  reversed_at: dto.reversed_at || null,
});

const tryMapTopUp = (dto: TopUpDto): TopUp[] => {
  try {
    return [mapTopUp(dto)];
  } catch {
    return [];
  }
};

export const mapTopUpsPage = ({ items, meta }: TopUpsPageDto): TopUpsPage => ({
  items: items.flatMap(tryMapTopUp),
  meta,
});
