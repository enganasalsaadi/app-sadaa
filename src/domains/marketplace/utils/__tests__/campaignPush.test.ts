import type { ParsedPush } from '@/core/notification';
import { campaignPushTags } from '../campaignPush';

const push = (overrides: Partial<ParsedPush>): ParsedPush => ({
  type: null,
  kind: null,
  entityId: null,
  target: null,
  ...overrides,
});

describe('campaignPushTags', () => {
  it('stales the campaign, its applicants and every list it shows in, for both roles', () => {
    expect(
      campaignPushTags(push({ kind: 'campaign_new_applications', target: { kind: 'campaign', campaignId: 'c1' } })),
    ).toEqual([
      { type: 'Campaign', id: 'c1' },
      { type: 'CampaignList', id: 'LIST' },
      { type: 'CampaignHistory', id: 'c1' },
      { type: 'CampaignDrop', id: 'c1' },
      { type: 'CampaignShipping', id: 'c1' },
      'BrandHome',
      { type: 'CreatorCampaign', id: 'c1' },
      { type: 'CreatorCampaignList', id: 'FEED' },
      { type: 'CreatorCampaignList', id: 'SAVED' },
      { type: 'CampaignApplicationList', id: 'LIST' },
      { type: 'CampaignApplicants', id: 'c1' },
      { type: 'CampaignApplication', id: 'c1' },
      'CreatorDealSummary',
    ]);
  });

  it('stales my applications, the launch room and the shipping manifest for a deal push: they all show the deal', () => {
    expect(campaignPushTags(push({ kind: 'deal_paid', target: { kind: 'deal', dealId: 'd1' } }))).toEqual([
      { type: 'CampaignApplicationList', id: 'LIST' },
      'CampaignDrop',
      'CampaignShipping',
    ]);
  });

  it.each(['campaign_selected', 'campaign_drop_reminder_120'])(
    'also stales the application and page of the campaign a %s names, though its link is the deal',
    kind => {
      expect(
        campaignPushTags(push({ kind, entityId: 'c1', target: { kind: 'deal', dealId: 'd1' } })),
      ).toEqual([
        { type: 'CampaignApplicationList', id: 'LIST' },
        'CampaignDrop',
        'CampaignShipping',
        { type: 'CampaignApplication', id: 'c1' },
        { type: 'CreatorCampaign', id: 'c1' },
        'CreatorDealSummary',
      ]);
    },
  );

  it('does not read a campaign out of a deal push whose entity is the deal', () => {
    expect(
      campaignPushTags(push({ kind: 'deal_return_required', entityId: 'd1', target: { kind: 'deal', dealId: 'd1' } })),
    ).toHaveLength(3);
    expect(
      campaignPushTags(push({ kind: 'campaign_selected', entityId: null, target: { kind: 'deal', dealId: 'd1' } })),
    ).toHaveLength(3);
  });

  it('touches nothing for other pushes', () => {
    expect(campaignPushTags(push({ target: { kind: 'strikes' } }))).toEqual([]);
    expect(campaignPushTags(push({}))).toEqual([]);
  });
});
