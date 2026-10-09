import { isCurrencyCode } from '@/core/money';
import type { CurrencyCode, Money } from '@/core/money';
import { WALLET_LINE_STATUS, WALLET_STATUS, WALLET_TRANSACTION_TYPES } from '../types';
import type {
  Counterparty,
  CounterpartyDto,
  ExchangeRate,
  ExchangeRateDto,
  MoneyDto,
  TransactionDirection,
  Wallet,
  WalletDto,
  WalletEarnings,
  WalletEarningsDto,
  WalletEscrow,
  WalletEscrowDto,
  WalletEscrows,
  WalletEscrowsDto,
  WalletLineStatus,
  WalletStatus,
  WalletSummary,
  WalletSummaryDto,
  WalletTransaction,
  WalletTransactionDto,
  WalletTransactionsPage,
  WalletTransactionsPageDto,
  WalletTransactionType,
} from '../types';

export const isOneOf = <T extends string>(values: readonly T[], value: string): value is T =>
  (values as readonly string[]).includes(value);

/**
 * A currency outside `CURRENCY_CODES` can't be formatted safely, so it fails the mapping:
 * a single object becomes a query error (the screen shows its error state), a list skips the line.
 */
const toCurrency = (currency: string): CurrencyCode => {
  if (!isCurrencyCode(currency)) throw new Error(`Unsupported currency: ${currency}`);
  return currency;
};

export const toMoney = ({ amount, currency }: MoneyDto): Money => ({
  amount,
  currency: toCurrency(currency),
});

/** Optional extras must never fail the object they ride on: an odd currency just hides them. */
export const toOptionalMoney = (dto: MoneyDto | null | undefined): Money | null => {
  if (!dto || !isCurrencyCode(dto.currency)) return null;
  return { amount: dto.amount, currency: dto.currency };
};

const toStatus = (status: string): WalletStatus | null =>
  isOneOf(WALLET_STATUS, status) ? status : null;

const toTransactionType = (type: string): WalletTransactionType | null =>
  isOneOf(WALLET_TRANSACTION_TYPES, type) ? type : null;

/** Server direction first; an unknown one falls back to the amount's sign. */
const toDirection = (direction: string, amount: number): TransactionDirection => {
  if (direction === 'credit' || direction === 'debit') return direction;
  return amount < 0 ? 'debit' : 'credit';
};

const toLineStatus = (status: string | null | undefined): WalletLineStatus | null =>
  status && isOneOf(WALLET_LINE_STATUS, status) ? status : null;

const toCounterparty = (dto: CounterpartyDto | null | undefined): Counterparty | null =>
  dto
    ? { type: dto.type, id: dto.id ?? null, name: dto.name, avatar_url: dto.avatar_url ?? null }
    : null;

const mapSummary = (dto: WalletSummaryDto | null | undefined): WalletSummary => ({
  month_in: toOptionalMoney(dto?.month_in),
  escrow: toOptionalMoney(dto?.escrow),
  pending_top_ups: toOptionalMoney(dto?.pending_top_ups),
});

export const mapWallet = (dto: WalletDto): Wallet => ({
  id: dto.id,
  status: toStatus(dto.status),
  status_label: dto.status_label,
  currency: toCurrency(dto.currency),
  available: toMoney(dto.available),
  pending: toMoney(dto.pending),
  total: toMoney(dto.total),
  summary: mapSummary(dto.summary),
});

export const mapWalletTransaction = (dto: WalletTransactionDto): WalletTransaction => ({
  reference: dto.reference,
  type: toTransactionType(dto.type),
  type_label: dto.type_label,
  direction: toDirection(dto.direction, dto.amount.amount),
  amount: toMoney(dto.amount),
  balance_after: toMoney(dto.balance_after),
  original: dto.original ? toMoney(dto.original) : null,
  exchange_rate: dto.exchange_rate ?? null,
  source: dto.source ?? null,
  details: dto.details ?? {},
  created_at: dto.created_at,
  description: dto.description || null,
  counterparty: toCounterparty(dto.counterparty),
  status: toLineStatus(dto.status),
  status_label: dto.status_label || null,
  affects_balance: dto.affects_balance !== false,
});

const tryMapTransaction = (dto: WalletTransactionDto): WalletTransaction[] => {
  try {
    return [mapWalletTransaction(dto)];
  } catch {
    return [];
  }
};

/** One bad line must not hide the whole statement. */
export const mapWalletTransactionsPage = ({
  items,
  meta,
}: WalletTransactionsPageDto): WalletTransactionsPage => ({
  items: items.flatMap(tryMapTransaction),
  meta,
});

/** `null` until an admin sets the first rate. */
export const mapExchangeRate = (dto: ExchangeRateDto | null): ExchangeRate | null =>
  dto && {
    rate: dto.rate,
    base: toCurrency(dto.base),
    quote: toCurrency(dto.quote),
    source: dto.source,
    is_stale: dto.is_stale,
    locked_until: dto.locked_until,
    effective_at: dto.effective_at,
  };

const mapEscrow = (dto: WalletEscrowDto): WalletEscrow => ({
  deal_id: dto.deal_id,
  deal_title: dto.deal_title,
  counterparty: toCounterparty(dto.counterparty),
  amount: toMoney(dto.amount),
  status_label: dto.status_label,
  release_hint: dto.release_hint || null,
  held_at: dto.held_at,
});

const tryMapEscrow = (dto: WalletEscrowDto): WalletEscrow[] => {
  try {
    return [mapEscrow(dto)];
  } catch {
    return [];
  }
};

export const mapWalletEscrows = ({ items, meta }: WalletEscrowsDto): WalletEscrows => ({
  items: items.flatMap(tryMapEscrow),
  count: meta.total,
  total_amount: toOptionalMoney(meta.total_amount),
});

/** The chart needs one currency: a bucket in another one fails the whole series (query error). */
export const mapWalletEarnings = (dto: WalletEarningsDto): WalletEarnings => {
  const total = toMoney(dto.total);
  return {
    total,
    buckets: dto.buckets.map(bucket => {
      const amount = toMoney(bucket.amount);
      if (amount.currency !== total.currency) {
        throw new Error(`Mixed earnings currencies: ${amount.currency} / ${total.currency}`);
      }
      return { month: bucket.month, amount };
    }),
    current_month: dto.current_month,
  };
};
