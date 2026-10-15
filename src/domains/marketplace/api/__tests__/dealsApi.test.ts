import { configureStore } from '@reduxjs/toolkit';
import { baseApi, IDEMPOTENCY_HEADER } from '@/core/api';
import { initSecureStorage } from '@/core/storage';
import { toastService } from '@/core/toast';
import type { DealDto } from '../../types/dealDto';
import { dealPushTags, dealsApi } from '../dealsApi';

const T0 = '2026-10-15T09:00:00+03:00';
const REF = { role: 'brand', id: '01J' } as const;

const makeStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: getDefault => getDefault({ serializableCheck: false }).concat(baseApi.middleware),
  });

const dealDto = (status: string, overrides: Partial<DealDto> = {}): DealDto => ({
  id: '01J',
  origin: 'direct',
  status: { key: status, label: status },
  stage: null,
  brand: { name: 'Cafe Sham', avatar_url: null },
  creator: { slug: 'reem', name: 'Reem', avatar_url: null },
  items: [],
  items_count: 0,
  total_usd: '150.00',
  currency: 'USD',
  shipping_mode: { key: 'none', label: 'None' },
  shipping: null,
  cancellation: null,
  delivery_hours: 120,
  requested_delivery_days: 5,
  extended_delivery_hours: null,
  extension: null,
  decline_reason: null,
  deadline_at: null,
  upsells: [],
  upsell_window: { open: false, closed_reason: null, pending_upsell_id: null },
  dispute: null,
  dispute_window: { open: false, closed_reason: null, disputes_left: 1 },
  retention: [],
  retention_cases: [],
  rating: null,
  brief: null,
  brief_attachments: [],
  due_at: T0,
  sent_at: T0,
  funded_at: null,
  contract: null,
  created_at: T0,
  updated_at: T0,
  ...overrides,
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const ok = (data: unknown, meta: object = {}) => json(200, { success: true, message: 'ok', data, meta });

const fail = (status: number, code: string, message: string) =>
  json(status, { success: false, message, error_code: code, errors: null, meta: { locale: 'en' } });

/** GET detail answers `detailStatus` (changeable); the action answers `actionResponse()`. */
const mockServer = (actionResponse: () => Response) => {
  const state = { detailStatus: 'awaiting_payment' };
  const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
    const request = input as Request;
    const { pathname } = new URL(request.url);
    if (request.method !== 'GET') return actionResponse();
    if (pathname.endsWith('/timeline')) return ok([]);
    if (pathname.includes('/deals/')) {
      return ok(dealDto(state.detailStatus), {
        funding: { funded: false, reason: 'insufficient_funds', missing_usd: '20.00' },
      });
    }
    return ok({ items: [dealDto('in_progress')], meta: { current_page: 1, last_page: 2, total: 21 } });
  });
  return { spy, state };
};

const detailReads = (spy: jest.SpyInstance) =>
  spy.mock.calls.filter(([input]) => {
    const request = input as Request;
    return request.method === 'GET' && new URL(request.url).pathname.endsWith('/brand/deals/01J');
  }).length;

const readDeal = (store: ReturnType<typeof makeStore>) =>
  dealsApi.endpoints.getDeal.select(REF)(store.getState()).data;

/** Lets the tag invalidation's refetch land. */
const settle = async () => {
  for (let i = 0; i < 5; i += 1) {
    await new Promise<void>(resolve => setImmediate(resolve));
  }
};

describe('dealsApi', () => {
  beforeAll(() => initSecureStorage());

  // Cache-lifetime and request-timeout timers would outlive the test.
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('reads the list page by page with repeated status keys', async () => {
    const { spy } = mockServer(() => ok(null));
    const store = makeStore();

    const page = await store.dispatch(
      dealsApi.endpoints.getDeals.initiate({ role: 'creator', statuses: ['in_progress', 'completed'] }),
    );

    const url = new URL((spy.mock.calls[0]?.[0] as Request).url);
    expect(url.pathname).toMatch(/\/influencer\/deals$/);
    expect(url.searchParams.getAll('status[]')).toEqual(['in_progress', 'completed']);
    expect(page.data?.pages[0]?.meta).toEqual({ currentPage: 1, lastPage: 2, total: 21 });
    expect(page.hasNextPage).toBe(true);
  });

  it('maps the brand detail with its funding preview', async () => {
    mockServer(() => ok(null));
    const store = makeStore();

    await store.dispatch(dealsApi.endpoints.getDeal.initiate(REF));

    expect(readDeal(store)?.deal.status.key).toBe('awaiting_payment');
    expect(readDeal(store)?.funding?.missing).toEqual({ amount: 2000, currency: 'USD' });
  });

  it('replaces the cached deal with the action response without refetching it', async () => {
    const { spy } = mockServer(() => ok(dealDto('in_progress', { funded_at: T0 })));
    const store = makeStore();
    const detail = store.dispatch(dealsApi.endpoints.getDeal.initiate(REF));
    await detail;

    const result = await store
      .dispatch(dealsApi.endpoints.runDealAction.initiate({ ref: REF, path: 'fund', idempotencyKey: 'key-1' }))
      .unwrap();
    await settle();

    expect(result.deal.status.key).toBe('in_progress');
    expect(readDeal(store)).toMatchObject({ deal: { status: { key: 'in_progress' } }, funding: null });
    const post = spy.mock.calls.map(([input]) => input as Request).find(r => r.method === 'POST');
    expect(post?.headers.get(IDEMPOTENCY_HEADER)).toBe('key-1');
    expect(detailReads(spy)).toBe(1);
    detail.unsubscribe();
  });

  it('refetches the deal after a deal conflict', async () => {
    const { spy, state } = mockServer(() => fail(409, 'deal_deadline_passed', 'The offer has closed'));
    const store = makeStore();
    const detail = store.dispatch(dealsApi.endpoints.getDeal.initiate(REF));
    await detail;
    state.detailStatus = 'cancelled_payment_timeout';

    await expect(
      store.dispatch(dealsApi.endpoints.runDealAction.initiate({ ref: REF, path: 'fund' })).unwrap(),
    ).rejects.toMatchObject({ status: 409 });
    await settle();

    expect(detailReads(spy)).toBe(2);
    expect(readDeal(store)?.deal.status.key).toBe('cancelled_payment_timeout');
    detail.unsubscribe();
  });

  it('passes a dispute 403 through to the caller instead of the global forbidden toast', async () => {
    mockServer(() => fail(403, 'deal_dispute_not_opener', 'Only the opener can withdraw'));
    const toast = jest.spyOn(toastService, 'error');
    const store = makeStore();

    await expect(
      store.dispatch(dealsApi.endpoints.runDealAction.initiate({ ref: REF, path: 'dispute/withdraw' })).unwrap(),
    ).rejects.toMatchObject({ status: 403 });

    expect(toast).not.toHaveBeenCalled();
  });
});

describe('dealPushTags', () => {
  it('refetches the deal and everything that moves with it', () => {
    expect(dealPushTags({ kind: 'deal', dealId: '01J' })).toEqual([
      { type: 'Deal', id: '01J' },
      { type: 'DealList', id: 'LIST' },
      { type: 'DealHistory', id: '01J' },
      'BrandHome',
      'CreatorDealSummary',
      'Wallet',
      'WalletEscrow',
      'WalletEarnings',
      { type: 'WalletTransaction', id: 'LIST' },
      'DealStrikes',
    ]);
  });

  it('refetches the strikes list on a strikes link', () => {
    expect(dealPushTags({ kind: 'strikes' })).toEqual(['DealStrikes']);
  });

  it('ignores other links and pushes without one', () => {
    expect(dealPushTags({ kind: 'wallet' })).toEqual([]);
    expect(dealPushTags(null)).toEqual([]);
  });
});
