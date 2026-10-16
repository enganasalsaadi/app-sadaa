import { configureStore } from '@reduxjs/toolkit';
import { baseApi, IDEMPOTENCY_HEADER } from '@/core/api';
import { initSecureStorage } from '@/core/storage';
import { toastService } from '@/core/toast';
import { campaignFlagReducer } from '../../store/campaignFlagSlice';
import { detailDto, historyRowDto } from '../../utils/__fixtures__/campaignDto';
import { brandCampaignsApi, campaignChangedTags } from '../brandCampaignsApi';

const makeStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, campaignFlag: campaignFlagReducer },
    middleware: getDefault => getDefault({ serializableCheck: false }).concat(baseApi.middleware),
  });

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const ok = (data: unknown, meta: object = {}) => json(200, { success: true, message: 'ok', data, meta });

const fail = (status: number, code: string, message: string) =>
  json(status, { success: false, message, error_code: code, errors: null, meta: { locale: 'en' } });

/** GET detail answers `detailStatus` (changeable); the action answers `actionResponse()`. */
const mockServer = (actionResponse: () => Response) => {
  const state = { detailStatus: 'open' };
  const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
    const request = input as Request;
    const { pathname } = new URL(request.url);
    if (request.method !== 'GET') return actionResponse();
    if (pathname.endsWith('/history')) return ok([historyRowDto()]);
    if (pathname.endsWith('/brand/campaigns')) {
      return ok({ items: [detailDto()], meta: { current_page: 1, last_page: 2, total: 21 } });
    }
    return ok(detailDto({ status: { key: state.detailStatus, label: state.detailStatus } }));
  });
  return { spy, state };
};

const detailReads = (spy: jest.SpyInstance) =>
  spy.mock.calls.filter(([input]) => {
    const request = input as Request;
    return request.method === 'GET' && new URL(request.url).pathname.endsWith('/brand/campaigns/c1');
  }).length;

const readCampaign = (store: ReturnType<typeof makeStore>) =>
  brandCampaignsApi.endpoints.getCampaign.select('c1')(store.getState()).data;

/** Lets the tag invalidation's refetch land. */
const settle = async () => {
  for (let i = 0; i < 5; i += 1) {
    await new Promise<void>(resolve => setImmediate(resolve));
  }
};

describe('brandCampaignsApi', () => {
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
      brandCampaignsApi.endpoints.getCampaigns.initiate({ statuses: ['open', 'suspended'] }),
    );

    const url = new URL((spy.mock.calls[0]?.[0] as Request).url);
    expect(url.pathname).toMatch(/\/brand\/campaigns$/);
    expect(url.searchParams.getAll('status[]')).toEqual(['open', 'suspended']);
    expect(url.searchParams.get('page')).toBe('1');
    expect(page.data?.pages[0]?.meta).toEqual({ currentPage: 1, lastPage: 2, total: 21 });
    expect(page.hasNextPage).toBe(true);
  });

  it('maps the detail and the history rows', async () => {
    mockServer(() => ok(null));
    const store = makeStore();

    await store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    const history = await store.dispatch(brandCampaignsApi.endpoints.getCampaignHistory.initiate('c1'));

    expect(readCampaign(store)?.pricing.seatPrice).toEqual({ amount: 10000, currency: 'USD' });
    expect(history.data?.[0]?.to.key).toBe('open');
  });

  it('replaces the cached campaign with the action response and reads the submit wallet', async () => {
    const wallet = { balance_usd: '10.00', required_usd: '80.00', shortfall_usd: '70.00', is_sufficient: false };
    const { spy } = mockServer(() => ok(detailDto({ status: { key: 'pending_review', label: 'In review' } }), { wallet }));
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;

    const result = await store
      .dispatch(
        brandCampaignsApi.endpoints.runCampaignAction.initiate({ id: 'c1', path: 'submit', idempotencyKey: 'key-1' }),
      )
      .unwrap();
    await settle();

    expect(result.campaign.status.key).toBe('pending_review');
    expect(result.wallet?.shortfall).toEqual({ amount: 7000, currency: 'USD' });
    expect(readCampaign(store)?.status.key).toBe('pending_review');
    const post = spy.mock.calls.map(([input]) => input as Request).find(r => r.method === 'POST');
    expect(new URL(post?.url ?? '').pathname).toMatch(/\/brand\/campaigns\/c1\/submit$/);
    expect(post?.headers.get(IDEMPOTENCY_HEADER)).toBe('key-1');
    expect(detailReads(spy)).toBe(1);
    detail.unsubscribe();
  });

  it('caches the duplicate under its own id', async () => {
    mockServer(() => json(201, { success: true, message: 'ok', data: detailDto({ id: 'c2', status: { key: 'draft', label: 'Draft' } }), meta: {} }));
    const store = makeStore();

    await store.dispatch(brandCampaignsApi.endpoints.runCampaignAction.initiate({ id: 'c1', path: 'duplicate' })).unwrap();
    await settle();

    expect(brandCampaignsApi.endpoints.getCampaign.select('c2')(store.getState()).data?.status.key).toBe('draft');
  });

  it('refetches the campaign after a campaign conflict', async () => {
    const { spy, state } = mockServer(() => fail(409, 'campaign_invalid_transition', 'It moved'));
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;
    state.detailStatus = 'suspended';

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.runCampaignAction.initiate({ id: 'c1', path: 'close' })).unwrap(),
    ).rejects.toMatchObject({ status: 409 });
    await settle();

    expect(detailReads(spy)).toBe(2);
    expect(readCampaign(store)?.status.key).toBe('suspended');
    detail.unsubscribe();
  });

  it('does not refetch on a validation failure and shows no toast itself', async () => {
    const { spy } = mockServer(() => fail(422, 'campaign_not_ready', 'Missing parts'));
    const toast = jest.spyOn(toastService, 'error');
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.runCampaignAction.initiate({ id: 'c1', path: 'submit' })).unwrap(),
    ).rejects.toMatchObject({ status: 422 });
    await settle();

    expect(detailReads(spy)).toBe(1);
    expect(toast).not.toHaveBeenCalled();
    detail.unsubscribe();
  });

  it('passes the KYC gate 403 through without the forbidden screen', async () => {
    mockServer(() => fail(403, 'kyc_required', 'Verify first'));
    const toast = jest.spyOn(toastService, 'error');
    const store = makeStore();

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.runCampaignAction.initiate({ id: 'c1', path: 'submit' })).unwrap(),
    ).rejects.toMatchObject({ status: 403 });

    expect(toast).not.toHaveBeenCalled();
  });

  it('flags the feature as off when a campaign call answers feature_disabled', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(async () => fail(404, 'feature_disabled', 'Off'));
    const store = makeStore();

    await store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));

    expect(store.getState().campaignFlag.serverDisabled).toBe(true);
  });
});

describe('campaignChangedTags', () => {
  it('refetches the list, the history and the brand home rail', () => {
    expect(campaignChangedTags('c1')).toEqual([
      { type: 'CampaignList', id: 'LIST' },
      { type: 'CampaignHistory', id: 'c1' },
      'BrandHome',
    ]);
  });
});
