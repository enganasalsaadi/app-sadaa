import type { ParseKeys } from 'i18next';
import type { ExchangeRate, MoneyDto, TopUpChannelsDto, TopUpDto } from '../../types';
import { buildFallbackChannels, mapTopUp, mapTopUpChannels, mapTopUpsPage } from '../topUpMappers';

// Channel icons are irrelevant to the mapping (lucide ships ESM).
jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const t = (key: ParseKeys) => `t:${key}`;
const money = (amount: number, currency = 'USD'): MoneyDto => ({ amount, currency, formatted: String(amount) });

const rate = (overrides: Partial<ExchangeRate> = {}): ExchangeRate => ({
  rate: '14000',
  base: 'USD',
  quote: 'SYP',
  source: 'admin',
  is_stale: false,
  locked_until: null,
  effective_at: '2026-10-09T08:00:00Z',
  ...overrides,
});

const byChannel = (channels: ReturnType<typeof buildFallbackChannels>['channels']) =>
  Object.fromEntries(channels.map(option => [option.channel, option]));

describe('buildFallbackChannels', () => {
  it('offers both currencies on offices and banks, pounds only on cash wallets, with a fresh rate', () => {
    const result = buildFallbackChannels(rate(), t, false);
    const channels = byChannel(result.channels);
    expect(result.source).toBe('fallback');
    expect(channels.haram?.currencies).toEqual(['USD', 'SYP']);
    expect(channels.syriatel_cash?.currencies).toEqual(['SYP']);
    expect(channels.syriatel_cash?.enabled).toBe(true);
    expect(channels.haram?.label).toBe('t:finance.channels.names.haram');
    expect(channels.haram?.groupLabel).toBe('t:finance.channels.groups.exchangeOffice');
    expect(channels.haram?.limits.SYP).toEqual({
      min: { amount: 140_000, currency: 'SYP' },
      max: { amount: 140_000_000, currency: 'SYP' },
    });
  });

  it('drops pounds and pauses the cash wallets while the rate is stale', () => {
    const channels = byChannel(buildFallbackChannels(rate({ is_stale: true }), t, false).channels);
    expect(channels.haram?.currencies).toEqual(['USD']);
    expect(channels.haram?.limits.SYP).toBeUndefined();
    expect(channels.mtn_cash).toMatchObject({
      enabled: false,
      currencies: [],
      disabledReason: 'fx_rate_stale',
      disabledLabel: 't:finance.topUp.disabled.rateStale',
    });
  });

  it('says the rate is missing when there is none', () => {
    const result = buildFallbackChannels(null, t, false);
    expect(result.rate).toBeNull();
    expect(byChannel(result.channels).syriatel_cash?.disabledReason).toBe('fx_rate_unavailable');
  });

  it('shows sample accounts only in mock mode', () => {
    expect(byChannel(buildFallbackChannels(rate(), t, false).channels).bank?.accounts).toEqual([]);
    const bank = byChannel(buildFallbackChannels(rate(), t, true).channels).bank;
    expect(bank?.accounts[0]?.fields[0]?.label).toBe('t:finance.topUp.mock.bankName');
  });
});

describe('mapTopUpChannels', () => {
  const dto: TopUpChannelsDto = {
    channels: [
      {
        channel: 'haram',
        label: 'الهرم',
        group: 'exchange_office',
        group_label: 'مكاتب الحوالات',
        currencies: ['USD', 'SYP', 'EUR'],
        enabled: true,
        limits: { USD: { min: money(1_000), max: money(500_000) }, EUR: { min: money(1, 'EUR'), max: money(2, 'EUR') } },
        accounts: [
          { id: 'a1', fields: [{ key: 'name', label: 'الاسم', value: 'صدى', copyable: true }] },
          { id: 'a2', fields: [{ key: 'name', label: 'الاسم', value: '  ', copyable: true }] },
        ],
      },
      { channel: 'western_union', label: 'WU', group: 'exchange_office', currencies: ['USD'], enabled: true },
      {
        channel: 'mtn_cash',
        label: 'MTN',
        group: 'mystery',
        currencies: [],
        enabled: true,
        disabled_reason: 'channel_paused',
        disabled_label: 'متوقف',
      },
    ],
    exchange_rate: { rate: '14000', is_stale: false, effective_at: '2026-10-09T08:00:00Z' },
    payer_reference: ' SD-7K3M9QXA ',
  };

  it('keeps known channels, currencies and limits, and drops empty accounts', () => {
    const result = mapTopUpChannels(dto);
    expect(result.source).toBe('server');
    expect(result.channels.map(option => option.channel)).toEqual(['haram', 'mtn_cash']);
    const haram = result.channels[0];
    expect(haram?.currencies).toEqual(['USD', 'SYP']);
    expect(haram?.limits).toEqual({ USD: { min: { amount: 1_000, currency: 'USD' }, max: { amount: 500_000, currency: 'USD' } } });
    expect(haram?.accounts.map(account => account.id)).toEqual(['a1']);
    expect(result.payerReference).toBe('SD-7K3M9QXA');
  });

  it('has no payer code when the server sends none (and none on the device fallback)', () => {
    expect(mapTopUpChannels({ ...dto, payer_reference: '' }).payerReference).toBeNull();
    expect(mapTopUpChannels({ channels: [] }).payerReference).toBeNull();
    expect(buildFallbackChannels(rate(), t, true).payerReference).toBeNull();
  });

  it('falls back to the app group and turns off a channel with nothing to send in', () => {
    const mtn = mapTopUpChannels(dto).channels[1];
    expect(mtn).toMatchObject({ group: 'e_wallet', enabled: false, disabledReason: 'channel_paused' });
  });
});

const topUpDto = (overrides: Partial<TopUpDto> = {}): TopUpDto => ({
  id: 'tu_1',
  status: 'pending_review',
  status_label: 'قيد المراجعة',
  channel: 'haram',
  amount: money(700_000, 'SYP'),
  amount_usd: money(5_000),
  exchange_rate: '14000',
  transfer_reference: '482913',
  ...overrides,
});

describe('mapTopUp', () => {
  it('maps a request and uses created_at when submitted_at is missing', () => {
    const topUp = mapTopUp(topUpDto({ created_at: '2026-10-09T08:00:00Z' }));
    expect(topUp).toMatchObject({
      status: 'pending_review',
      channel: 'haram',
      amount: { amount: 700_000, currency: 'SYP' },
      amount_usd: { amount: 5_000, currency: 'USD' },
      submitted_at: '2026-10-09T08:00:00Z',
      receipt: null,
    });
  });

  it('keeps the signed receipt link with its expiry', () => {
    const receipt = {
      url: 'https://api.getsada.app/api/v1/wallet/top-ups/tu_1/receipt?expires=1&signature=x',
      mime_type: 'image/jpeg',
      size_bytes: null,
      name: 'receipt.jpg',
      expires_at: '2026-10-09T10:10:00Z',
    };
    expect(mapTopUp(topUpDto({ receipt })).receipt).toEqual(receipt);
  });

  it('keeps unknown status and channel as null', () => {
    expect(mapTopUp(topUpDto({ status: 'on_hold', channel: 'paypal' }))).toMatchObject({ status: null, channel: null });
  });

  it('skips unreadable items in a page', () => {
    const page = mapTopUpsPage({
      items: [topUpDto(), topUpDto({ id: 'bad', amount: money(1, 'EUR') })],
      meta: { current_page: 1, last_page: 1, total: 2 },
    });
    expect(page.items.map(item => item.id)).toEqual(['tu_1']);
  });
});
