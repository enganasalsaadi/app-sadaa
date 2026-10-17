import {
  buildBrandApplicantUrl,
  buildBrandApplicantsCompareUrl,
  buildBrandApplicantsUrl,
  buildBrandCampaignFilesUrl,
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

  it('builds the applicants list with repeated filter keys and only the filters that are on', () => {
    expect(
      buildBrandApplicantsUrl(
        {
          id: 'c1',
          statuses: ['submitted'],
          sort: 'expiring',
          governorates: ['damascus', 'aleppo'],
          niches: ['food'],
          minFollowers: 10000,
          invitedOnly: true,
        },
        3,
      ),
    ).toBe(
      '/brand/campaigns/c1/applications?status%5B%5D=submitted&governorate%5B%5D=damascus&governorate%5B%5D=aleppo&niche%5B%5D=food&min_followers=10000&invited=1&sort=expiring&page=3',
    );
    expect(
      buildBrandApplicantsUrl(
        { id: 'c1', statuses: ['selected'], sort: 'newest', governorates: [], niches: [], minFollowers: null, invitedOnly: false },
        1,
      ),
    ).toBe('/brand/campaigns/c1/applications?status%5B%5D=selected&sort=newest&page=1');
  });

  it('builds one applicant and its decisions', () => {
    expect(buildBrandApplicantUrl({ id: 'c1', applicationId: 'a1' })).toBe('/brand/campaigns/c1/applications/a1');
    expect(buildBrandApplicantUrl({ id: 'c1', applicationId: 'a1' }, 'shortlist')).toBe(
      '/brand/campaigns/c1/applications/a1/shortlist',
    );
    expect(buildBrandApplicantUrl({ id: 'c1', applicationId: 'a1' }, 'reject')).toBe(
      '/brand/campaigns/c1/applications/a1/reject',
    );
  });

  it('builds the compare call with repeated ids', () => {
    expect(buildBrandApplicantsCompareUrl({ id: 'c1', ids: ['a1', 'a2', 'a3'] })).toBe(
      '/brand/campaigns/c1/applications/compare?ids%5B%5D=a1&ids%5B%5D=a2&ids%5B%5D=a3',
    );
  });

  it('encodes each segment of an action path', () => {
    expect(buildBrandCampaignUrl('a/b')).toBe('/brand/campaigns/a%2Fb');
    expect(buildBrandCampaignUrl('c1', 'seats/reopen')).toBe('/brand/campaigns/c1/seats/reopen');
    expect(buildBrandCampaignUrl('c1', 'zero-applicants/extend')).toBe('/brand/campaigns/c1/zero-applicants/extend');
  });

  it('builds the file slot, confirm and delete urls', () => {
    expect(buildBrandCampaignFilesUrl('c1')).toBe('/brand/campaigns/c1/files');
    expect(buildBrandCampaignFilesUrl('c1', 'f 2')).toBe('/brand/campaigns/c1/files/f%202');
    expect(buildBrandCampaignFilesUrl('c1', 'f2', 'complete')).toBe('/brand/campaigns/c1/files/f2/complete');
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
