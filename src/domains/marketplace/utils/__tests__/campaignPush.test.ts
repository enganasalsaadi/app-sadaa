import { campaignPushTags } from '../campaignPush';

describe('campaignPushTags', () => {
  it('stales the campaign and every list it shows in, for both roles', () => {
    expect(campaignPushTags({ kind: 'campaign', campaignId: 'c1' })).toEqual([
      { type: 'Campaign', id: 'c1' },
      { type: 'CampaignList', id: 'LIST' },
      { type: 'CampaignHistory', id: 'c1' },
      'BrandHome',
      { type: 'CreatorCampaign', id: 'c1' },
      { type: 'CreatorCampaignList', id: 'FEED' },
      { type: 'CreatorCampaignList', id: 'SAVED' },
      { type: 'CampaignApplicationList', id: 'LIST' },
    ]);
  });

  it('touches nothing for other pushes', () => {
    expect(campaignPushTags({ kind: 'deal', dealId: 'd1' })).toEqual([]);
    expect(campaignPushTags({ kind: 'strikes' })).toEqual([]);
    expect(campaignPushTags(null)).toEqual([]);
  });
});
