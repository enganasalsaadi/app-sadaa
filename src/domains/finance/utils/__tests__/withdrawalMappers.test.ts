import type { AppApiError } from '@/core/api';
import type { MoneyDto, WithdrawalDto } from '../../types';
import {
  mapWithdrawal,
  mapWithdrawalQuote,
  mapWithdrawalsPage,
  parseWithdrawalBlock,
} from '../withdrawalMappers';

const money = (amount: number, currency = 'USD'): MoneyDto => ({ amount, currency, formatted: String(amount) });

const withdrawal = (overrides: Partial<WithdrawalDto> = {}): WithdrawalDto => ({
  id: 'w1',
  status: 'pending',
  status_label: 'قيد التحويل',
  gross: money(20_000),
  fee: money(300),
  net: money(19_700),
  net_payout: money(2_758_000, 'SYP'),
  exchange_rate: '14000.0000',
  channel: 'sham_cash',
  destination_label: 'شام كاش · •••• 3456',
  created_at: '2026-10-09T10:00:00Z',
  ...overrides,
});

const apiError = (overrides: Partial<AppApiError>): AppApiError => ({
  statusCode: 422,
  message: 'not allowed',
  code: null,
  retryAfter: null,
  reason: null,
  availableAt: null,
  details: null,
  isValidationError: true,
  isUnauthorized: false,
  isForbidden: false,
  isServerError: false,
  ...overrides,
});

describe('mapWithdrawalQuote', () => {
  it('maps the amounts and keeps every reason, unknown codes by their label', () => {
    const quote = mapWithdrawalQuote({
      allowed: false,
      reasons: [
        { code: 'cooldown_active', label: 'يُسمح بسحب واحد كل 7 أيام' },
        { code: 'brand_new_rule', label: 'Something new' },
        { code: 'also_new', label: '' },
      ],
      next_allowed_at: '2026-10-15T09:00:00Z',
      gross: money(20_000),
      fee: money(300),
      net: money(19_700),
      net_payout: money(2_758_000, 'SYP'),
      exchange_rate: '14000.0000',
    });
    expect(quote.reasons).toEqual([
      { code: 'cooldown_active', label: 'يُسمح بسحب واحد كل 7 أيام' },
      { code: null, label: 'Something new' },
    ]);
    expect(quote.net_payout).toEqual({ amount: 2_758_000, currency: 'SYP' });
    expect(quote.next_allowed_at).toBe('2026-10-15T09:00:00Z');
  });

  it('leaves missing amounts empty instead of failing', () => {
    const quote = mapWithdrawalQuote({ allowed: false, gross: null, net_payout: money(5, 'EUR') });
    expect(quote.gross).toBeNull();
    expect(quote.net_payout).toBeNull();
    expect(quote.reasons).toEqual([]);
    expect(quote.exchange_rate).toBeNull();
  });
});

describe('mapWithdrawal', () => {
  it('maps a known status and channel', () => {
    const result = mapWithdrawal(withdrawal());
    expect(result.status).toBe('pending');
    expect(result.channel).toBe('sham_cash');
    expect(result.gross).toEqual({ amount: 20_000, currency: 'USD' });
    expect(result.completed_at).toBeNull();
  });

  it('turns an unknown status or channel into null', () => {
    const result = mapWithdrawal(withdrawal({ status: 'on_hold', channel: 'paypal' }));
    expect(result.status).toBeNull();
    expect(result.channel).toBeNull();
    expect(result.status_label).toBe('قيد التحويل');
  });

  it('skips a row whose amount currency is unknown, keeping the page', () => {
    const page = mapWithdrawalsPage({
      items: [withdrawal(), withdrawal({ id: 'w2', gross: money(1, 'EUR') })],
      meta: { current_page: 1, last_page: 1, total: 2 },
    });
    expect(page.items.map(item => item.id)).toEqual(['w1']);
  });
});

describe('parseWithdrawalBlock', () => {
  it('reads code-only reasons and the next allowed time from the envelope meta', () => {
    const block = parseWithdrawalBlock(
      apiError({
        code: 'withdrawal_not_allowed',
        details: {
          success: false,
          meta: { reasons: ['cooldown_active', 'unknown_code', 7], next_allowed_at: '2026-10-15T09:00:00Z' },
        },
      }),
    );
    expect(block).toEqual({
      reasons: [{ code: 'cooldown_active', label: null }],
      next_allowed_at: '2026-10-15T09:00:00Z',
    });
  });

  it('accepts reason objects with labels', () => {
    const block = parseWithdrawalBlock(
      apiError({
        code: 'withdrawal_not_allowed',
        details: { meta: { reasons: [{ code: 'open_request_exists', label: 'لديك طلب مفتوح' }] } },
      }),
    );
    expect(block?.reasons).toEqual([{ code: 'open_request_exists', label: 'لديك طلب مفتوح' }]);
    expect(block?.next_allowed_at).toBeNull();
  });

  it('returns null for other errors and survives a missing meta', () => {
    expect(parseWithdrawalBlock(apiError({ code: 'wallet_frozen' }))).toBeNull();
    expect(parseWithdrawalBlock(apiError({ code: 'withdrawal_not_allowed', details: 'oops' }))).toEqual({
      reasons: [],
      next_allowed_at: null,
    });
  });
});
