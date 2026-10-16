import { createSlice, isFulfilled, isRejectedWithValue } from '@reduxjs/toolkit';
import { baseApi, normalizeApiError } from '@/core/api';

/**
 * Public Campaigns run behind a server flag with no bootstrap key (contract §1.2). The homes say
 * `campaignsEnabled`; this slice records the other signal, a campaign call answering
 * `404 feature_disabled` (flag flipped mid-session, deep link before Home loaded). Session-only:
 * a fresh Home answer or a logout clears it.
 */
export interface CampaignFlagState {
  serverDisabled: boolean;
}

const initialState: CampaignFlagState = { serverDisabled: false };

/** The two reads that carry `campaignsEnabled` (Brand Home, creator deals summary). */
const HOME_ENDPOINTS: readonly string[] = ['getBrandHome', 'getCreatorDealSummary'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isFeatureDisabledRejection = (action: unknown): boolean =>
  isRejectedWithValue(action) && normalizeApiError(action.payload).code === 'feature_disabled';

// Matched by endpoint name, not by importing the home APIs: those pull the identity barrel (UI) into the store.
const isHomeReportingCampaignsOn = (action: unknown): boolean => {
  if (!isFulfilled(action) || !isRecord(action.meta.arg) || !isRecord(action.payload)) return false;
  const { endpointName } = action.meta.arg;
  return (
    typeof endpointName === 'string' &&
    HOME_ENDPOINTS.includes(endpointName) &&
    action.payload.campaignsEnabled === true
  );
};

const campaignFlagSlice = createSlice({
  name: 'campaignFlag',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addMatcher(isFeatureDisabledRejection, () => ({ serverDisabled: true }))
      .addMatcher(isHomeReportingCampaignsOn, () => initialState)
      .addMatcher(baseApi.util.resetApiState.match, () => initialState);
  },
});

export const campaignFlagReducer = campaignFlagSlice.reducer;
