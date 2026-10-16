import {
  buildBrandCampaignsUrl,
  buildBrandCampaignUrl,
  buildCreatorApplicationsUrl,
  buildCreatorFeedUrl,
} from '../campaignQuery';

describe('campaignQuery', () => {
  it('builds the brand list with repeated status keys', () => {
    expect(buildBrandCampaignsUrl({ statuses: ['draft', 'changes_requested'] }, 2)).toBe(
      '/brand/campaigns?status%5B%5D=draft&status%5B%5D=changes_requested&page=2',
    );
    expect(buildBrandCampaignsUrl({}, 1)).toBe('/brand/campaigns?page=1');
  });

  it('encodes each segment of an action path', () => {
    expect(buildBrandCampaignUrl('a/b')).toBe('/brand/campaigns/a%2Fb');
    expect(buildBrandCampaignUrl('c1', 'seats/reopen')).toBe('/brand/campaigns/c1/seats/reopen');
    expect(buildBrandCampaignUrl('c1', 'zero-applicants/extend')).toBe('/brand/campaigns/c1/zero-applicants/extend');
  });

  it('keeps the feed to the two server filters', () => {
    expect(buildCreatorFeedUrl({ activityTypes: ['fashion_beauty'], pricingModel: 'fixed' }, 3)).toBe(
      '/influencer/campaigns?activity_type%5B%5D=fashion_beauty&pricing_model=fixed&page=3',
    );
    expect(buildCreatorFeedUrl({ pricingModel: null }, 1)).toBe('/influencer/campaigns?page=1');
  });

  it('builds my applications by tab', () => {
    expect(buildCreatorApplicationsUrl({ statuses: ['selected'] }, 1)).toBe(
      '/influencer/campaign-applications?status%5B%5D=selected&page=1',
    );
  });
});
