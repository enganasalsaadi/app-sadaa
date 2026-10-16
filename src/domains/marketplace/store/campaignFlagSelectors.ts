import type { RootState } from '@/app/store/rootReducer';

export const selectCampaignsServerDisabled = (state: RootState): boolean =>
  state.campaignFlag.serverDisabled;
