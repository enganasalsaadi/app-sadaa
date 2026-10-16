import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/core/api';
import { initSecureStorage } from '@/core/storage';
import { applicationDto, creatorCampaignDto } from '../../utils/__fixtures__/campaignDto';
import { creatorCampaignsApi } from '../creatorCampaignsApi';

const makeStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: getDefault => getDefault({ serializableCheck: false }).concat(baseApi.middleware),
  });

const ok = (data: unknown) =>
  new Response(JSON.stringify({ success: true, message: 'ok', data, meta: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const page = (items: unknown[]) => ok({ items, meta: { current_page: 1, last_page: 1, total: items.length } });

const requestUrl = (spy: jest.SpyInstance) => new URL((spy.mock.calls[0]?.[0] as Request).url);

describe('creatorCampaignsApi', () => {
  beforeAll(() => initSecureStorage());

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('sends only the server-side feed filters', async () => {
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async () => page([creatorCampaignDto()]));
    const store = makeStore();

    const result = await store.dispatch(
      creatorCampaignsApi.endpoints.getCampaignFeed.initiate({
        activityTypes: ['restaurant_cafe', 'fashion_beauty'],
        pricingModel: 'bidding',
      }),
    );

    const url = requestUrl(spy);
    expect(url.pathname).toMatch(/\/influencer\/campaigns$/);
    expect(url.searchParams.getAll('activity_type[]')).toEqual(['restaurant_cafe', 'fashion_beauty']);
    expect(url.searchParams.get('pricing_model')).toBe('bidding');
    expect(result.data?.pages[0]?.items[0]?.pricing.fixed?.net).toEqual({ amount: 9000, currency: 'USD' });
  });

  it('omits the filter keys when none are set', async () => {
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async () => page([]));
    const store = makeStore();

    await store.dispatch(creatorCampaignsApi.endpoints.getCampaignFeed.initiate({}));

    expect(requestUrl(spy).search).toBe('?page=1');
  });

  it('reads the saved list and the teaser detail', async () => {
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
      const { pathname } = new URL((input as Request).url);
      return pathname.endsWith('/saved') ? page([creatorCampaignDto({ bookmarked: true })]) : ok(creatorCampaignDto());
    });
    const store = makeStore();

    const saved = await store.dispatch(creatorCampaignsApi.endpoints.getSavedCampaigns.initiate());
    const detail = await store.dispatch(creatorCampaignsApi.endpoints.getCreatorCampaign.initiate('c1'));

    expect(requestUrl(spy).pathname).toMatch(/\/influencer\/campaigns\/saved$/);
    expect(saved.data?.pages[0]?.items[0]?.bookmarked).toBe(true);
    expect(detail.data?.seats.left).toBe(3);
  });

  it('reads my applications by tab and one application', async () => {
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
      const { pathname } = new URL((input as Request).url);
      return pathname.endsWith('/p1') ? ok(applicationDto()) : page([applicationDto()]);
    });
    const store = makeStore();

    const list = await store.dispatch(
      creatorCampaignsApi.endpoints.getCampaignApplications.initiate({ statuses: ['submitted', 'shortlisted'] }),
    );
    const one = await store.dispatch(creatorCampaignsApi.endpoints.getCampaignApplication.initiate('p1'));

    const url = requestUrl(spy);
    expect(url.pathname).toMatch(/\/influencer\/campaign-applications$/);
    expect(url.searchParams.getAll('status[]')).toEqual(['submitted', 'shortlisted']);
    expect(list.data?.pages[0]?.items[0]?.price.net).toEqual({ amount: 9000, currency: 'USD' });
    expect(one.data?.campaign.id).toBe('c1');
  });
});
