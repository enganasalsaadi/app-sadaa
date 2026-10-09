import type { AppApiError } from '@/core/api';
import { PAYMENT_CHANNELS, WITHDRAWAL_REASON_CODES, WITHDRAWAL_STATUS } from '../types';
import type {
  Withdrawal,
  WithdrawalBlock,
  WithdrawalDto,
  WithdrawalQuote,
  WithdrawalQuoteDto,
  WithdrawalReason,
  WithdrawalReasonDto,
  WithdrawalsPage,
  WithdrawalsPageDto,
} from '../types';
import { isOneOf, toMoney, toOptionalMoney } from './walletMappers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toReason = (dto: WithdrawalReasonDto): WithdrawalReason => ({
  code: isOneOf(WITHDRAWAL_REASON_CODES, dto.code) ? dto.code : null,
  label: dto.label?.trim() || null,
});

/** A reason the app can neither name nor show is dropped. */
const toReasons = (dtos: readonly WithdrawalReasonDto[] | null | undefined): WithdrawalReason[] =>
  (dtos ?? []).map(toReason).filter(reason => reason.code !== null || reason.label !== null);

export const mapWithdrawalQuote = (dto: WithdrawalQuoteDto): WithdrawalQuote => ({
  allowed: dto.allowed,
  reasons: toReasons(dto.reasons),
  next_allowed_at: dto.next_allowed_at || null,
  gross: toOptionalMoney(dto.gross),
  fee: toOptionalMoney(dto.fee),
  net: toOptionalMoney(dto.net),
  net_payout: toOptionalMoney(dto.net_payout),
  exchange_rate: dto.exchange_rate || null,
});

export const mapWithdrawal = (dto: WithdrawalDto): Withdrawal => ({
  id: dto.id,
  status: isOneOf(WITHDRAWAL_STATUS, dto.status) ? dto.status : null,
  status_label: dto.status_label,
  gross: toMoney(dto.gross),
  fee: toOptionalMoney(dto.fee),
  net: toOptionalMoney(dto.net),
  net_payout: toOptionalMoney(dto.net_payout),
  exchange_rate: dto.exchange_rate || null,
  channel: dto.channel && isOneOf(PAYMENT_CHANNELS, dto.channel) ? dto.channel : null,
  destination_label: dto.destination_label || null,
  receipt_number: dto.receipt_number || null,
  rejection_reason: dto.rejection_reason || null,
  return_reason: dto.return_reason || null,
  created_at: dto.created_at,
  completed_at: dto.completed_at ?? null,
  rejected_at: dto.rejected_at ?? null,
  cancelled_at: dto.cancelled_at ?? null,
  returned_at: dto.returned_at ?? null,
});

const tryMapWithdrawal = (dto: WithdrawalDto): Withdrawal[] => {
  try {
    return [mapWithdrawal(dto)];
  } catch {
    return [];
  }
};

/** One bad row must not hide the whole history. */
export const mapWithdrawalsPage = ({ items, meta }: WithdrawalsPageDto): WithdrawalsPage => ({
  items: items.flatMap(tryMapWithdrawal),
  meta,
});

/** `meta.reasons` holds codes (handoff §8); a server that sends `{code, label}` objects works too. */
const toBlockReason = (value: unknown): WithdrawalReasonDto | null => {
  if (typeof value === 'string') return { code: value };
  if (isRecord(value) && typeof value.code === 'string') {
    return { code: value.code, label: typeof value.label === 'string' ? value.label : null };
  }
  return null;
};

/**
 * Reasons and the next allowed time of a `422 withdrawal_not_allowed`, read from the raw
 * envelope (`details`); `null` for any other error.
 */
export const parseWithdrawalBlock = (error: AppApiError): WithdrawalBlock | null => {
  if (error.code !== 'withdrawal_not_allowed') return null;
  const meta = isRecord(error.details) && isRecord(error.details.meta) ? error.details.meta : {};
  const raw = Array.isArray(meta.reasons) ? meta.reasons : [];
  const dtos = raw.map(toBlockReason).filter((dto): dto is WithdrawalReasonDto => dto !== null);
  return {
    reasons: toReasons(dtos),
    next_allowed_at: typeof meta.next_allowed_at === 'string' && meta.next_allowed_at ? meta.next_allowed_at : null,
  };
};
