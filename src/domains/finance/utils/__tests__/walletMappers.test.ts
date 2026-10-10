import {
  mapExchangeRate,
  mapWallet,
  mapWalletEarnings,
  mapWalletEscrows,
  mapWalletTransaction,
  mapWalletTransactionsPage,
  toMoney,
} from '../walletMappers';
import type {
  ExchangeRateDto,
  MoneyDto,
  WalletDto,
  WalletEscrowDto,
  WalletTransactionDto,
} from '../../types';

const usd = (amount: number): MoneyDto => ({
  amount,
  formatted: (amount / 100).toFixed(2),
  currency: 'USD',
});

const walletDto = (overrides: Partial<WalletDto> = {}): WalletDto => ({
  id: '01J',
  status: 'active',
  status_label: 'نشطة',
  currency: 'USD',
  available: usd(9000),
  pending: usd(1000),
  total: usd(10000),
  ...overrides,
});

const transactionDto = (overrides: Partial<WalletTransactionDto> = {}): WalletTransactionDto => ({
  reference: 'TRX-202610-7K3M9Q',
  type: 'top_up',
  type_label: 'شحن المحفظة',
  direction: 'credit',
  amount: usd(5000),
  balance_after: usd(14000),
  original: { amount: 700000, formatted: '700,000', currency: 'SYP' },
  exchange_rate: '14000.0000',
  source: { type: 'top_up_request', id: '01J' },
  details: { channel: 'haram', transfer_reference: 'HR-1' },
  created_at: '2026-10-08T10:00:00Z',
  ...overrides,
});

describe('toMoney', () => {
  it('keeps minor units and drops the server string', () => {
    expect(toMoney(usd(12345))).toEqual({ amount: 12345, currency: 'USD' });
    expect(toMoney({ amount: 700000, formatted: '700,000', currency: 'SYP' })).toEqual({
      amount: 700000,
      currency: 'SYP',
    });
  });

  it('rejects a currency this build cannot format', () => {
    expect(() => toMoney({ amount: 1, formatted: '0.01', currency: 'EUR' })).toThrow(
      'Unsupported currency: EUR',
    );
  });
});

describe('mapWallet', () => {
  it('maps every balance to Money', () => {
    expect(mapWallet(walletDto())).toEqual({
      id: '01J',
      status: 'active',
      status_label: 'نشطة',
      currency: 'USD',
      available: { amount: 9000, currency: 'USD' },
      pending: { amount: 1000, currency: 'USD' },
      total: { amount: 10000, currency: 'USD' },
      summary: { month_in: null, escrow: null, pending_top_ups: null },
    });
  });

  it('maps the v4 summary and hides only the fields it cannot format', () => {
    const summary = mapWallet(
      walletDto({
        summary: {
          month_in: usd(64000),
          escrow: { amount: 1, formatted: '1', currency: 'EUR' },
          pending_top_ups: null,
        },
      }),
    ).summary;
    expect(summary).toEqual({
      month_in: { amount: 64000, currency: 'USD' },
      escrow: null,
      pending_top_ups: null,
    });
  });

  it('keeps known statuses and nulls unknown ones', () => {
    expect(mapWallet(walletDto({ status: 'frozen' })).status).toBe('frozen');
    expect(mapWallet(walletDto({ status: 'closed' })).status).toBe('closed');
    expect(mapWallet(walletDto({ status: 'archived' })).status).toBeNull();
  });

  it('fails on an unknown wallet currency', () => {
    expect(() => mapWallet(walletDto({ currency: 'EUR' }))).toThrow();
  });
});

describe('mapWalletTransaction', () => {
  it('maps a SYP top-up with its original amount and rate', () => {
    expect(mapWalletTransaction(transactionDto())).toEqual({
      reference: 'TRX-202610-7K3M9Q',
      type: 'top_up',
      type_label: 'شحن المحفظة',
      direction: 'credit',
      amount: { amount: 5000, currency: 'USD' },
      balance_after: { amount: 14000, currency: 'USD' },
      original: { amount: 700000, currency: 'SYP' },
      exchange_rate: '14000.0000',
      source: { type: 'top_up_request', id: '01J' },
      details: { channel: 'haram', transfer_reference: 'HR-1' },
      created_at: '2026-10-08T10:00:00Z',
      description: null,
      counterparty: null,
      status: null,
      status_label: null,
      affects_balance: true,
      commission: null,
    });
  });

  it('reads the commission on a creator escrow release', () => {
    const mapped = mapWalletTransaction(
      transactionDto({
        type: 'escrow_release',
        amount: usd(36000),
        original: null,
        exchange_rate: null,
        source: { type: 'escrow_hold', id: '01JHOLD' },
        details: { gross_cents: 40000, commission_cents: 4000, rate_percent: 10 },
      }),
    );
    expect(mapped.amount).toEqual({ amount: 36000, currency: 'USD' });
    expect(mapped.commission).toEqual({
      gross: { amount: 40000, currency: 'USD' },
      commission: { amount: 4000, currency: 'USD' },
      rate_percent: 10,
    });
  });

  it('drops a zero, malformed or non-release commission', () => {
    const release = (details: Record<string, unknown>) =>
      mapWalletTransaction(transactionDto({ type: 'escrow_release', details })).commission;
    expect(release({ gross_cents: 40000, commission_cents: 0, rate_percent: 0 })).toBeNull();
    expect(release({ gross_cents: '400', commission_cents: 4000, rate_percent: 10 })).toBeNull();
    expect(release({ gross_cents: 40000, commission_cents: 40.5, rate_percent: 10 })).toBeNull();
    expect(release({ gross_cents: 40000, commission_cents: 4000 })).toBeNull();
    expect(
      mapWalletTransaction(
        transactionDto({
          type: 'escrow_split',
          details: { gross_cents: 40000, commission_cents: 4000, rate_percent: 10 },
        }),
      ).commission,
    ).toBeNull();
  });

  it('maps a disputed escrow hold', () => {
    const mapped = mapWalletTransaction(
      transactionDto({ type: 'escrow_hold', status: 'disputed', status_label: 'متنازع عليها' }),
    );
    expect(mapped.status).toBe('disputed');
  });

  it('maps the v4 subject, counterparty and open status', () => {
    const mapped = mapWalletTransaction(
      transactionDto({
        type: 'withdrawal_request',
        description: 'شام كاش',
        counterparty: { type: 'payout_channel', name: 'شام كاش' },
        status: 'pending',
        status_label: 'قيد التحويل',
      }),
    );
    expect(mapped.description).toBe('شام كاش');
    expect(mapped.counterparty).toEqual({
      type: 'payout_channel',
      id: null,
      name: 'شام كاش',
      avatar_url: null,
    });
    expect(mapped.status).toBe('pending');
    expect(mapped.status_label).toBe('قيد التحويل');
  });

  it('keeps the label of an unknown status and reads memo lines', () => {
    const mapped = mapWalletTransaction(
      transactionDto({ status: 'queued', status_label: 'بالانتظار', affects_balance: false }),
    );
    expect(mapped.status).toBeNull();
    expect(mapped.status_label).toBe('بالانتظار');
    expect(mapped.affects_balance).toBe(false);
  });

  it('defaults the optional fields', () => {
    const mapped = mapWalletTransaction(
      transactionDto({
        original: undefined,
        exchange_rate: undefined,
        source: undefined,
        details: null,
      }),
    );
    expect(mapped.original).toBeNull();
    expect(mapped.exchange_rate).toBeNull();
    expect(mapped.source).toBeNull();
    expect(mapped.details).toEqual({});
  });

  it('nulls an unknown type and keeps the server label', () => {
    const mapped = mapWalletTransaction(
      transactionDto({ type: 'cashback', type_label: 'استرداد نقدي' }),
    );
    expect(mapped.type).toBeNull();
    expect(mapped.type_label).toBe('استرداد نقدي');
  });

  it('keeps a signed debit and falls back to the sign for an unknown direction', () => {
    const debit = transactionDto({ type: 'provider_fee', direction: 'debit', amount: usd(-400) });
    expect(mapWalletTransaction(debit).amount).toEqual({ amount: -400, currency: 'USD' });
    expect(mapWalletTransaction(debit).direction).toBe('debit');
    expect(mapWalletTransaction(transactionDto({ direction: '', amount: usd(-400) })).direction).toBe(
      'debit',
    );
    expect(mapWalletTransaction(transactionDto({ direction: '' })).direction).toBe('credit');
  });
});

describe('mapWalletTransactionsPage', () => {
  it('keeps the meta and skips only the lines it cannot map', () => {
    const meta = { current_page: 1, last_page: 3, total: 45 };
    const page = mapWalletTransactionsPage({
      items: [
        transactionDto({ reference: 'TRX-1' }),
        transactionDto({ reference: 'TRX-2', amount: { amount: 1, formatted: '1', currency: 'EUR' } }),
        transactionDto({ reference: 'TRX-3' }),
      ],
      meta,
    });
    expect(page.items.map(item => item.reference)).toEqual(['TRX-1', 'TRX-3']);
    expect(page.meta).toBe(meta);
  });
});

describe('mapExchangeRate', () => {
  const rateDto: ExchangeRateDto = {
    rate: '14000.0000',
    quote: 'SYP',
    base: 'USD',
    source: 'manual',
    is_stale: false,
    locked_until: null,
    effective_at: '2026-10-08T09:00:00Z',
  };

  it('maps the rate and keeps it a string', () => {
    expect(mapExchangeRate(rateDto)).toEqual({
      rate: '14000.0000',
      base: 'USD',
      quote: 'SYP',
      source: 'manual',
      is_stale: false,
      locked_until: null,
      effective_at: '2026-10-08T09:00:00Z',
    });
  });

  it('returns null before the first rate is set', () => {
    expect(mapExchangeRate(null)).toBeNull();
  });
});

describe('mapWalletEscrows', () => {
  const escrowDto = (overrides: Partial<WalletEscrowDto> = {}): WalletEscrowDto => ({
    id: '01JHOLD',
    deal_id: '01JD',
    deal_title: 'حملة الصيف',
    counterparty: { type: 'brand', id: '01JB', name: 'Zara Home', avatar_url: null },
    amount: usd(125000),
    status: 'held',
    status_label: 'في الضمان',
    release_hint: 'تُحرَّر تلقائياً بعد تأكيد النشر',
    held_at: '2026-10-08T18:30:00Z',
    ...overrides,
  });

  it('maps the deals, the count and the total', () => {
    const escrows = mapWalletEscrows({
      items: [
        escrowDto(),
        escrowDto({ id: '01JHOLD2', amount: { amount: 1, formatted: '1', currency: 'EUR' } }),
      ],
      meta: { current_page: 1, last_page: 1, total: 2, total_amount: usd(250000) },
    });
    expect(escrows.items.map(item => item.id)).toEqual(['01JHOLD']);
    expect(escrows.items[0]?.status).toBe('held');
    expect(escrows.items[0]?.counterparty?.name).toBe('Zara Home');
    expect(escrows.count).toBe(2);
    expect(escrows.total_amount).toEqual({ amount: 250000, currency: 'USD' });
  });

  it('leaves the total out when the server does', () => {
    const escrows = mapWalletEscrows({
      items: [escrowDto({ release_hint: '' })],
      meta: { current_page: 1, last_page: 1, total: 1 },
    });
    expect(escrows.total_amount).toBeNull();
    expect(escrows.items[0]?.release_hint).toBeNull();
  });

  it('nulls the deal until deals ship and keeps a disputed hold', () => {
    const escrows = mapWalletEscrows({
      items: [escrowDto({ deal_id: null, deal_title: null, status: 'disputed' }), escrowDto({ status: 'frozen' })],
      meta: { current_page: 1, last_page: 1, total: 2 },
    });
    expect(escrows.items[0]).toMatchObject({ deal_id: null, deal_title: null, status: 'disputed' });
    expect(escrows.items[0]?.counterparty?.name).toBe('Zara Home');
    expect(escrows.items[1]?.status).toBeNull();
  });
});

describe('mapWalletEarnings', () => {
  it('maps the total and every month in order', () => {
    expect(
      mapWalletEarnings({
        period: '6m',
        total: usd(184000),
        buckets: [
          { month: '2026-09', amount: usd(0) },
          { month: '2026-10', amount: usd(184000) },
        ],
        current_month: '2026-10',
      }),
    ).toEqual({
      total: { amount: 184000, currency: 'USD' },
      buckets: [
        { month: '2026-09', amount: { amount: 0, currency: 'USD' } },
        { month: '2026-10', amount: { amount: 184000, currency: 'USD' } },
      ],
      current_month: '2026-10',
    });
  });

  it('fails on a bucket in another currency', () => {
    expect(() =>
      mapWalletEarnings({
        period: '6m',
        total: usd(0),
        buckets: [{ month: '2026-10', amount: { amount: 0, formatted: '0', currency: 'SYP' } }],
        current_month: '2026-10',
      }),
    ).toThrow();
  });
});
