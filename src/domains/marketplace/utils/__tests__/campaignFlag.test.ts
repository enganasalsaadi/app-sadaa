import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/core/api';
import { campaignFlagReducer } from '../../store/campaignFlagSlice';
import { resolveCampaignsEnabled } from '../campaignFlag';
import { mapBrandHome } from '../exploreMappers';
import { mapCreatorDealSummary } from '../dealMappers';

// The barrel pulls navigators and UI; only the price-lock helpers are read.
jest.mock('@/domains/identity', () => ({
  ...jest.requireActual<object>('@/domains/identity/utils/priceLock'),
  ...jest.requireActual<object>('@/domains/identity/constants/priceLock'),
}));

describe('resolveCampaignsEnabled', () => {
  it('is off as soon as the server said feature_disabled', () => {
    expect(resolveCampaignsEnabled(true, true)).toBe(false);
  });

  it('follows the cached Home, and is unknown until it loads', () => {
    expect(resolveCampaignsEnabled(false, true)).toBe(true);
    expect(resolveCampaignsEnabled(false, false)).toBe(false);
    expect(resolveCampaignsEnabled(false, undefined)).toBeNull();
  });
});

describe('Home flag detection', () => {
  const summaryDto = { active_deals: null, counts: { new_offers: 0, pending_upsells: 0, live_strikes: 0 } };

  it('reads the creator summary: campaigns null or absent = off', () => {
    expect(mapCreatorDealSummary(summaryDto).campaignsEnabled).toBe(false);
    expect(mapCreatorDealSummary({ ...summaryDto, campaigns: null }).campaignsEnabled).toBe(false);
    expect(
      mapCreatorDealSummary({ ...summaryDto, campaigns: { feed_count: 0, new_invites: 0, open_applications: 0 } })
        .campaignsEnabled,
    ).toBe(true);
  });

  it('reads the brand home: active_campaigns null or absent = off', () => {
    const home = {
      header: { company_name: null, governorate: null, wallet: { available_usd: 0, available_syp_approx: null, syp_rate_stale: false } },
      island: null,
      rails: [],
      support: { whatsapp_url: null },
      capabilities: { view_prices: { allowed: true, reason: null } },
    };
    expect(mapBrandHome(home).campaignsEnabled).toBe(false);
    expect(mapBrandHome({ ...home, active_campaigns: { needs_action_count: 0, total_count: 0, items: [] } }).campaignsEnabled).toBe(true);
  });
});

describe('campaignFlagReducer', () => {
  const makeStore = () =>
    configureStore({
      reducer: { [baseApi.reducerPath]: baseApi.reducer, campaignFlag: campaignFlagReducer },
      middleware: getDefault => getDefault({ serializableCheck: false }).concat(baseApi.middleware),
    });

  it('starts enabled and clears on an API reset (logout)', () => {
    const store = makeStore();
    expect(store.getState().campaignFlag.serverDisabled).toBe(false);

    store.dispatch({
      type: 'api/executeQuery/rejected',
      payload: { status: 404, data: { success: false, message: 'Off', error_code: 'feature_disabled' } },
      meta: { rejectedWithValue: true, requestStatus: 'rejected', requestId: 'r1' },
      error: { message: 'Rejected' },
    });
    expect(store.getState().campaignFlag.serverDisabled).toBe(true);

    store.dispatch(baseApi.util.resetApiState());
    expect(store.getState().campaignFlag.serverDisabled).toBe(false);
  });
});
