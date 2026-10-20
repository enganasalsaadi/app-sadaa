import { shouldShowTwoWays } from '../brandHomeTwoWays';

const fresh = { campaignsEnabled: true, noOpenDeal: true, noActiveCampaign: true };

describe('shouldShowTwoWays', () => {
  it('shows for a new brand when campaigns are on', () => {
    expect(shouldShowTwoWays(fresh)).toBe(true);
  });

  it.each([false, null])('hides while campaigns are %s', campaignsEnabled => {
    expect(shouldShowTwoWays({ ...fresh, campaignsEnabled })).toBe(false);
  });

  it('hides once a deal is open', () => {
    expect(shouldShowTwoWays({ ...fresh, noOpenDeal: false })).toBe(false);
  });

  it('hides once a campaign is active', () => {
    expect(shouldShowTwoWays({ ...fresh, noActiveCampaign: false })).toBe(false);
  });
});
