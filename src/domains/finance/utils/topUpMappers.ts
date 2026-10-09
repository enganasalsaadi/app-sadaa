import type { ParseKeys } from 'i18next';
import { isCurrencyCode } from '@/core/money';
import type { CurrencyCode } from '@/core/money';
import { PAYMENT_CHANNEL_DEF, PAYMENT_GROUP_LABEL } from '../constants/paymentChannels';
import { TOP_UP_DISABLED_LABEL, TOP_UP_MOCK_ACCOUNTS } from '../constants/topUp';
import {
  PAYMENT_CHANNEL_GROUPS,
  PAYMENT_CHANNELS,
  TOP_UP_DISABLED_REASONS,
  TOP_UP_STATUS,
} from '../types';
import type {
  ExchangeRate,
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
import { fallbackLimits } from './topUpEstimate';
import { isOneOf, toMoney, toOptionalMoney } from './walletMappers';

type Translate = (key: ParseKeys) => string;

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

/** An unknown channel is dropped (the POST would reject it); an unknown group uses the app's own. */
const mapChannel = (dto: TopUpChannelDto): TopUpChannelOption[] => {
  if (!isOneOf(PAYMENT_CHANNELS, dto.channel)) return [];
  const def = PAYMENT_CHANNEL_DEF[dto.channel];
  const group = isOneOf(PAYMENT_CHANNEL_GROUPS, dto.group) ? dto.group : def.group;
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
  source: 'server',
});

/**
 * Channels built on the device while the server predates the endpoint: the handoff's
 * fixed rules (cash wallets SYP only, SYP off without a fresh rate, $10 – $10,000).
 * Receiving accounts exist only as DEV samples (`mock`); otherwise none, and the
 * transfer step points the brand to support.
 */
export const buildFallbackChannels = (
  rate: ExchangeRate | null,
  t: Translate,
  mock: boolean,
): TopUpChannels => {
  const usableRate = rate && !rate.is_stale ? rate.rate : null;
  const channels = PAYMENT_CHANNELS.map<TopUpChannelOption>(channel => {
    const def = PAYMENT_CHANNEL_DEF[channel];
    const currencies = def.currencies.filter(currency => currency === 'USD' || usableRate !== null);
    const enabled = currencies.length > 0;
    const disabledReason = enabled ? null : rate ? 'fx_rate_stale' : 'fx_rate_unavailable';
    const limits: Partial<Record<CurrencyCode, TopUpLimits>> = {};
    for (const currency of currencies) {
      const range = fallbackLimits(currency, usableRate);
      if (range) limits[currency] = range;
    }
    return {
      channel,
      label: t(def.labelKey),
      group: def.group,
      groupLabel: t(PAYMENT_GROUP_LABEL[def.group]),
      currencies,
      enabled,
      disabledReason,
      disabledLabel: disabledReason ? t(TOP_UP_DISABLED_LABEL[disabledReason]) : null,
      limits,
      accounts: mock
        ? TOP_UP_MOCK_ACCOUNTS[def.group].map(account => ({
            id: account.id,
            fields: account.fields.map(field => ({ ...field, label: t(field.label) })),
          }))
        : [],
      instructions: null,
      processingTimeLabel: null,
    };
  });
  return {
    channels,
    rate: rate ? { rate: rate.rate, is_stale: rate.is_stale, effective_at: rate.effective_at } : null,
    payerReference: null,
    source: 'fallback',
  };
};

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
  channel: isOneOf(PAYMENT_CHANNELS, dto.channel) ? dto.channel : null,
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
