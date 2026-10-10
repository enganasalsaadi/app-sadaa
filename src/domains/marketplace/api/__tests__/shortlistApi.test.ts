import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/core/api';
import { initSecureStorage } from '@/core/storage';
import type { ExploreCreatorDto } from '../../types/explore';
import { brandHomeApi } from '../brandHomeApi';
import { exploreApi } from '../exploreApi';
import { shortlistApi } from '../shortlistApi';

// The barrel pulls navigators and UI; only the price-lock helpers are read.
jest.mock('@/domains/identity', () => ({
  ...jest.requireActual<object>('@/domains/identity/utils/priceLock'),
  ...jest.requireActual<object>('@/domains/identity/constants/priceLock'),
}));

const makeStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: getDefault => getDefault({ serializableCheck: false }).concat(baseApi.middleware),
  });

const creator = (slug: string, isShortlisted = false): ExploreCreatorDto => ({
  slug,
  display_name: slug,
  avatar_url: null,
  governorate: null,
  niches: [],
  tier: null,
  tier_label: null,
  primary_platform: null,
  platforms: [],
  badges: { kyc_verified: false, followers_verified: false, rush: false, on_site: false, new: false },
  fastest_delivery_days: null,
  price: { locked: true, lock_reason: 'kyc_required', from_usd: null, from_syp_approx: null, syp_rate_stale: false },
  is_shortlisted: isShortlisted,
});

const json = (status: number, body: unknown) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const ok = (data: unknown, meta: object = {}) => json(200, { success: true, message: 'ok', data, meta });

const home = {
  header: { company_name: null, governorate: null, wallet: { available_usd: 0, available_syp_approx: null, syp_rate_stale: true } },
  island: null,
  rails: [{ key: 'new', title: 'New', items: [creator('reem')], see_all: {} }],
  support: { whatsapp_url: null },
  capabilities: { view_prices: { allowed: false, reason: 'kyc_required' } },
};

/** Routes GETs to fixtures; the shortlist write answers `writeStatus`. */
const mockServer = (writeStatus: number) =>
  jest.spyOn(global, 'fetch').mockImplementation(async input => {
    const request = input as Request;
    const { pathname } = new URL(request.url);
    if (request.method !== 'GET') {
      return writeStatus === 204
        ? new Response(null, { status: 204 })
        : json(writeStatus, { success: false, message: 'full', error_code: 'shortlist_full', data: null });
    }
    if (pathname.endsWith('/brand/home')) {
      return ok(home);
    }
    if (pathname.endsWith('/explore/creators')) {
      return ok([creator('reem'), creator('sami')], { next_cursor: null, price_locked: true });
    }
    return ok([creator('reem', true)], { next_cursor: null });
  });

const seed = async (store: ReturnType<typeof makeStore>) => {
  await store.dispatch(brandHomeApi.endpoints.getBrandHome.initiate());
  await store.dispatch(exploreApi.endpoints.getExploreCreators.initiate({ rush: true }));
  await store.dispatch(shortlistApi.endpoints.getShortlist.initiate());
};

const read = (store: ReturnType<typeof makeStore>) => {
  const state = store.getState();
  return {
    home: brandHomeApi.endpoints.getBrandHome.select()(state).data?.rails[0]?.items[0]?.isShortlisted,
    explore: exploreApi.endpoints.getExploreCreators
      .select({ rush: true })(state)
      .data?.pages[0]?.items.map(item => [item.slug, item.isShortlisted]),
    shortlist: shortlistApi.endpoints.getShortlist
      .select()(state)
      .data?.pages[0]?.items.map(item => item.slug),
  };
};

describe('shortlistApi.setShortlisted', () => {
  beforeAll(() => initSecureStorage());

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('PUTs and flips ❤️ in Home and Explore caches', async () => {
    const fetchSpy = mockServer(204);
    const store = makeStore();
    await seed(store);
    const card = exploreApi.endpoints.getExploreCreators.select({ rush: true })(store.getState()).data
      ?.pages[0]?.items[0];
    if (!card) {
      throw new Error('explore not seeded');
    }

    await store.dispatch(shortlistApi.endpoints.setShortlisted.initiate({ card, shortlisted: true }));

    const write = fetchSpy.mock.calls.map(call => call[0] as Request).find(r => r.method === 'PUT');
    expect(write?.url).toMatch(/\/brand\/shortlist\/reem$/);
    expect(read(store)).toMatchObject({ home: true, explore: [['reem', true], ['sami', false]] });
  });

  it('rolls every cache back when the server refuses (409 shortlist_full)', async () => {
    mockServer(409);
    const store = makeStore();
    await seed(store);
    const card = exploreApi.endpoints.getExploreCreators.select({ rush: true })(store.getState()).data
      ?.pages[0]?.items[0];
    if (!card) {
      throw new Error('explore not seeded');
    }

    const result = await store.dispatch(
      shortlistApi.endpoints.setShortlisted.initiate({ card, shortlisted: true }),
    );

    expect('error' in result).toBe(true);
    expect(read(store)).toMatchObject({ home: false, explore: [['reem', false], ['sami', false]] });
  });

  it('DELETE removes the creator from the Shortlist list', async () => {
    const fetchSpy = mockServer(204);
    const store = makeStore();
    await seed(store);
    const card = shortlistApi.endpoints.getShortlist.select()(store.getState()).data?.pages[0]?.items[0];
    if (!card) {
      throw new Error('shortlist not seeded');
    }

    await store.dispatch(shortlistApi.endpoints.setShortlisted.initiate({ card, shortlisted: false }));

    expect(fetchSpy.mock.calls.some(call => (call[0] as Request).method === 'DELETE')).toBe(true);
    expect(read(store).shortlist).toEqual([]);
  });
});
