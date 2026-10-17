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
    expect(detail.data?.seats.free).toBe(3);
  });

  describe('setCampaignBookmarked', () => {
    const cachedFeed = async (store: ReturnType<typeof makeStore>, bookmarked = false) => {
      jest.spyOn(global, 'fetch').mockImplementationOnce(async () => page([creatorCampaignDto({ bookmarked })]));
      await store.dispatch(creatorCampaignsApi.endpoints.getCampaignFeed.initiate({}));
    };
    const feedBookmark = (store: ReturnType<typeof makeStore>) =>
      creatorCampaignsApi.endpoints.getCampaignFeed.select({})(store.getState()).data?.pages[0]?.items[0]?.bookmarked;

    it('saves with POST and flips the loaded card', async () => {
      const store = makeStore();
      await cachedFeed(store);
      const spy = jest.spyOn(global, 'fetch').mockImplementation(async () => ok(null));

      await store.dispatch(creatorCampaignsApi.endpoints.setCampaignBookmarked.initiate({ id: 'c1', bookmarked: true }));

      const request = spy.mock.calls.at(-1)?.[0] as Request;
      expect(request.method).toBe('POST');
      expect(new URL(request.url).pathname).toMatch(/\/influencer\/campaigns\/c1\/bookmark$/);
      expect(feedBookmark(store)).toBe(true);
    });

    it('removes with DELETE and takes the card out of the saved list at once', async () => {
      const store = makeStore();
      await cachedFeed(store, true);
      jest.spyOn(global, 'fetch').mockImplementationOnce(async () => page([creatorCampaignDto({ bookmarked: true })]));
      await store.dispatch(creatorCampaignsApi.endpoints.getSavedCampaigns.initiate());
      const spy = jest.spyOn(global, 'fetch').mockImplementation(async () => ok(null));

      await store.dispatch(creatorCampaignsApi.endpoints.setCampaignBookmarked.initiate({ id: 'c1', bookmarked: false }));

      expect((spy.mock.calls.at(-1)?.[0] as Request).method).toBe('DELETE');
      expect(feedBookmark(store)).toBe(false);
      const saved = creatorCampaignsApi.endpoints.getSavedCampaigns.select()(store.getState()).data;
      expect(saved?.pages[0]?.items).toEqual([]);
    });

    it('puts the card back when the server refuses', async () => {
      const store = makeStore();
      await cachedFeed(store);
      jest.spyOn(global, 'fetch').mockImplementation(async () =>
        new Response(JSON.stringify({ success: false, message: 'gone', data: null, error_code: 'not_found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await store.dispatch(creatorCampaignsApi.endpoints.setCampaignBookmarked.initiate({ id: 'c1', bookmarked: true }));

      expect(feedBookmark(store)).toBe(false);
    });
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
  describe('withdrawCampaignApplication', () => {
    const withdrawn = () =>
      applicationDto({
        status: { key: 'withdrawn', label: 'Withdrawn' },
        state: { key: 'withdrawn', label: 'Withdrawn', source: 'application' },
        can_withdraw: false,
      });

    it('posts the withdrawal, caches the application and re-reads the open list', async () => {
      const store = makeStore();
      jest.spyOn(global, 'fetch').mockImplementationOnce(async () => page([applicationDto()]));
      await store.dispatch(
        creatorCampaignsApi.endpoints.getCampaignApplications.initiate({ statuses: ['submitted', 'shortlisted'] }),
      );
      const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
        const { pathname } = new URL((input as Request).url);
        return pathname.endsWith('/withdraw') ? ok(withdrawn()) : page([]);
      });

      const result = await store.dispatch(creatorCampaignsApi.endpoints.withdrawCampaignApplication.initiate('p1'));

      const request = spy.mock.calls
        .map(([input]) => input as Request)
        .find(call => new URL(call.url).pathname.endsWith('/withdraw'));
      expect(request?.method).toBe('POST');
      expect(new URL(request?.url ?? '').pathname).toMatch(/\/influencer\/campaign-applications\/p1\/withdraw$/);
      expect(result.data?.status.key).toBe('withdrawn');
      await jest.advanceTimersByTimeAsync(0);
      expect(creatorCampaignsApi.endpoints.getCampaignApplication.select('p1')(store.getState()).data?.canWithdraw).toBe(
        false,
      );
      const listCalls = spy.mock.calls.filter(([input]) => new URL((input as Request).url).pathname.endsWith('/campaign-applications'));
      expect(listCalls.length).toBeGreaterThan(1);
    });

    it('re-reads the lists when the server says it was already decided', async () => {
      const store = makeStore();
      jest.spyOn(global, 'fetch').mockImplementationOnce(async () => page([applicationDto()]));
      await store.dispatch(
        creatorCampaignsApi.endpoints.getCampaignApplications.initiate({ statuses: ['submitted', 'shortlisted'] }),
      );
      const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
        const { pathname } = new URL((input as Request).url);
        return pathname.endsWith('/withdraw')
          ? new Response(
              JSON.stringify({ success: false, message: 'Already decided', data: null, error_code: 'campaign_invalid_transition' }),
              { status: 409, headers: { 'Content-Type': 'application/json' } },
            )
          : page([]);
      });

      const result = await store.dispatch(creatorCampaignsApi.endpoints.withdrawCampaignApplication.initiate('p1'));
      await jest.advanceTimersByTimeAsync(0);

      expect('error' in result).toBe(true);
      const listCalls = spy.mock.calls.filter(([input]) => new URL((input as Request).url).pathname.endsWith('/campaign-applications'));
      expect(listCalls.length).toBeGreaterThan(1);
    });
  });
});
